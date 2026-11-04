(function () {
  'use strict';
  var root = document.getElementById('gallery');
  if (!root) return;
  var clips = [
    {id:'panda-v7',robot:'panda',task:'mug_hang',label:'Dyna',plain:'panda_mug_v7_final',poster:'panda_mug_v7_final',note:'在线 Dyna 选定演示；不把单个片段与多 seed 均值绑定。'},
    {id:'panda-teacher',robot:'panda',task:'mug_hang',label:'Teacher',success:79.3,plain:'panda_mug_teacher_s0',hud:'teacher_hud',poster:'panda_mug_teacher_s0',posterHud:'teacher_hud',note:'原画与 HUD 是不同录制回合，不是同步对照。'},
    {id:'panda-bc',robot:'panda',task:'mug_hang',label:'BC',plain:'panda_mug_v7_bc_init',poster:'panda_mug_v7_bc_init',note:'BC 初始化策略的历史演示；没有绑定可核验的片段专属评测分数。'},
    {id:'arx5-teacher',robot:'arx5',task:'mug_hang',label:'Teacher',success:97.7,plain:'teacher',poster:'teacher'},
    {id:'piper-teacher',robot:'piper',task:'mug_hang',label:'Teacher',success:46.1,hud:'verified_20261104/teacher_hud',posterHud:'verified_20261104/teacher_hud',duration:6.45,realTime:true,note:'选定成功回合，seed 200042。保留接近过程不等于确认完整未抓取起点。'},
    {id:'ur5e-teacher',robot:'ur5e',task:'mug_hang',label:'Teacher',success:62.5,hud:'verified_20261104/teacher_hud',posterHud:'verified_20261104/teacher_hud',duration:8.95,realTime:true,note:'Robotiq 夹爪使用棱柱手指近似；连杆省略来自仿真模型，不是画面裁切。'},
    {id:'xarm7-teacher',robot:'xarm7',task:'mug_hang',label:'Teacher',success:46.5,hud:'verified_20261104/teacher_hud',posterHud:'verified_20261104/teacher_hud',duration:8.4,realTime:true,note:'仿真 xArm 夹爪使用棱柱近似。所示为选定演示，成绩来自独立评测。'},
    {id:'piper-lemon',robot:'piper',task:'lemon',label:'Teacher',success:99.2,hud:'teacher_hud',posterHud:'teacher_hud',note:'柠檬放置教师演示。原生终态成功不自动证明标准抓取搬运；旧录像计时未校正。'}
  ];
  var robots = {panda:'Panda',arx5:'ARX5',piper:'PiPER',ur5e:'UR5e',xarm7:'xArm7'};
  var tasks = {mug_hang:'挂杯',lemon:'柠檬放置'};
  var video = root.querySelector('#galleryVideo');
  var list = root.querySelector('#clipList');
  var caption = root.querySelector('#clipCaption');
  var context = root.querySelector('#clipContext');
  var status = root.querySelector('#playerStatus');
  var empty = root.querySelector('#playerEmpty');
  var toggle = root.querySelector('#togglePlayback');
  var restart = root.querySelector('#restartClip');
  var seek = root.querySelector('#clipSeek');
  var clock = root.querySelector('#seekTime');
  var count = root.querySelector('#galleryCount');
  var modes = root.querySelector('#modePills');
  var filters = {robot:'all',task:'all'};
  var current = null;
  var mode = 'plain';
  var generation = 0;
  var durations = {};
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  video.muted = true;
  video.defaultMuted = true;
  video.autoplay = !reducedMotion.matches;
  video.loop = true;
  video.playsInline = true;

  function url(clip, name, extension) {
    return 'static/videos/rollouts/' + clip.robot + '/' + clip.task + '/' + name + extension;
  }
  function visible() {
    return clips.filter(function (clip) {
      return (filters.robot === 'all' || clip.robot === filters.robot) &&
             (filters.task === 'all' || clip.task === filters.task);
    });
  }
  function timing() {
    return current && current.realTime ? '真实时间' : 'legacy capture / 旧版计时';
  }
  function playback() {
    if (!current) return;
    var revision = generation;
    video.muted = true;
    var attempt = video.play();
    if (attempt && attempt.catch) attempt.catch(function (error) {
      if (revision !== generation || error.name === 'AbortError') return;
      status.textContent = '浏览器暂停了自动播放，请点击播放。';
      toggle.textContent = '播放';
      toggle.setAttribute('aria-label', '播放视频');
    });
  }
  function updateURL() {
    var address = new URL(window.location.href);
    ['robot', 'task'].forEach(function (key) {
      if (filters[key] === 'all') address.searchParams.delete(key);
      else address.searchParams.set(key, filters[key]);
    });
    if (current) address.searchParams.set('clip', current.id);
    else address.searchParams.delete('clip');
    window.history.replaceState(null, '', address.toString());
  }
  function syncFilters() {
    root.querySelectorAll('.filter-group').forEach(function (group) {
      group.querySelectorAll('button').forEach(function (button) {
        var active = filters[group.dataset.filter] === button.dataset.value;
        button.classList.toggle('active', active);
        button.setAttribute('aria-pressed', active ? 'true' : 'false');
      });
    });
  }
  function renderList() {
    var available = visible();
    list.textContent = '';
    available.forEach(function (clip) {
      var button = document.createElement('button');
      button.type = 'button';
      button.dataset.clip = clip.id;
      var active = current && current.id === clip.id;
      button.className = 'clip-btn' + (active ? ' active' : '');
      button.setAttribute('aria-pressed', active ? 'true' : 'false');
      var thumb = document.createElement('img');
      thumb.className = 'clip-thumb'; thumb.alt = ''; thumb.loading = 'lazy';
      thumb.src = url(clip, clip.poster || clip.posterHud, '.jpg');
      button.appendChild(thumb);
      var text = document.createElement('span'); text.className = 'clip-text';
      var title = document.createElement('span'); title.className = 'clip-title'; title.textContent = robots[clip.robot] + ' / ' + clip.label;
      var meta = document.createElement('span'); meta.className = 'clip-meta'; meta.textContent = tasks[clip.task];
      text.appendChild(title); text.appendChild(meta); button.appendChild(text);
      var duration = document.createElement('span'); duration.className = 'clip-dur'; duration.dataset.duration = clip.id;
      var seconds = durations[clip.id] || clip.duration;
      duration.textContent = seconds ? seconds.toFixed(1) + ' s' : '';
      button.appendChild(duration);
      button.addEventListener('click', function () {
        select(clip); updateURL();
        var selected = list.querySelector('[data-clip="' + clip.id + '"]');
        if (selected) selected.focus({preventScroll:true});
      });
      list.appendChild(button);
    });
    count.textContent = available.length + ' 段录像';
    if (!available.length) {
      var message = document.createElement('p'); message.className = 'clips-empty';
      message.textContent = '还没有这个组合的录像，试试其他任务。'; list.appendChild(message);
    }
  }
  function updateModes() {
    modes.querySelectorAll('button').forEach(function (button) {
      var key = button.dataset.mode;
      button.disabled = !current || !current[key];
      button.classList.toggle('active', !!current && mode === key);
      button.setAttribute('aria-pressed', current && mode === key ? 'true' : 'false');
    });
  }
  function loadVideo() {
    generation += 1;
    video.pause();
    video.hidden = false; empty.hidden = true;
    video.poster = url(current, mode === 'hud' ? (current.posterHud || current.poster) : current.poster, '.jpg');
    video.src = url(current, current[mode], '.mp4');
    video.load();
    status.textContent = reducedMotion.matches ? '点击播放 / ' + timing() : '静音循环 / ' + timing();
    toggle.textContent = '播放'; toggle.setAttribute('aria-label', '播放视频');
    toggle.disabled = restart.disabled = seek.disabled = false;
    seek.value = 0; clock.textContent = '0.0 / 0.0 s';
    updateModes();
    if (!reducedMotion.matches) playback();
  }
  function select(clip) {
    current = clip; mode = clip.plain ? 'plain' : 'hud';
    caption.textContent = '';
    var name = document.createElement('span'); name.className = 'cap-robot'; name.textContent = robots[clip.robot];
    var task = document.createElement('span'); task.textContent = tasks[clip.task] + ' / ' + clip.label;
    var score = document.createElement('span'); score.className = 'cap-success';
    score.textContent = typeof clip.success === 'number' ? '历史混合复位：' + clip.success.toFixed(1) + '%' : '历史演示 / 未绑定片段分数';
    caption.appendChild(name); caption.appendChild(task); caption.appendChild(score);
    context.textContent = clip.note || '选定的历史仿真演示；成绩来自独立评测，不是片段的成功比例。';
    renderList(); loadVideo();
  }
  function clearPlayer() {
    generation += 1; current = null; video.pause(); video.removeAttribute('src'); video.removeAttribute('poster'); video.load();
    video.hidden = true; empty.hidden = false; caption.textContent = ''; context.textContent = '';
    status.textContent = '请选择有录像的机器人与任务';
    toggle.disabled = restart.disabled = seek.disabled = true; seek.value = 0; clock.textContent = '0.0 / 0.0 s';
    seek.setAttribute('aria-valuetext','没有可播放的录像'); updateModes();
  }
  function readURL() {
    var params = new URLSearchParams(window.location.search);
    filters.robot = Object.prototype.hasOwnProperty.call(robots, params.get('robot')) ? params.get('robot') : 'all';
    filters.task = Object.prototype.hasOwnProperty.call(tasks, params.get('task')) ? params.get('task') : 'all';
    syncFilters();
    var available = visible();
    var selected = available.find(function (clip) { return clip.id === params.get('clip'); });
    if (available.length) select(selected || available[0]);
    else { clearPlayer(); renderList(); }
  }
  root.querySelectorAll('.filter-group').forEach(function (group) {
    group.querySelectorAll('button').forEach(function (button) {
      button.type = 'button';
      button.addEventListener('click', function () {
        filters[group.dataset.filter] = button.dataset.value; syncFilters();
        var available = visible();
        if (!available.length) { clearPlayer(); renderList(); }
        else if (!current || available.indexOf(current) === -1) select(available[0]);
        else renderList();
        updateURL();
      });
    });
  });
  modes.querySelectorAll('button').forEach(function (button) {
    button.type = 'button';
    button.addEventListener('click',function () { if (!current || button.disabled || mode === button.dataset.mode) return; mode = button.dataset.mode; loadVideo(); });
  });
  toggle.addEventListener('click',function () { if (!current) return; if (video.paused) playback(); else video.pause(); });
  restart.addEventListener('click',function () { if (!current) return; video.currentTime = 0; playback(); });
  seek.addEventListener('input',function () { if (current && isFinite(video.duration)) video.currentTime = video.duration * Number(seek.value) / 1000; });
  video.addEventListener('timeupdate',function () {
    if (!current || !isFinite(video.duration)) return;
    seek.value = video.duration ? Math.round(1000 * video.currentTime / video.duration) : 0;
    clock.textContent = video.currentTime.toFixed(1) + ' / ' + video.duration.toFixed(1) + ' s';
    seek.setAttribute('aria-valuetext', video.currentTime.toFixed(1) + ' 秒，共 ' + video.duration.toFixed(1) + ' 秒');
  });
  video.addEventListener('loadedmetadata',function () {
    if (!current || !isFinite(video.duration)) return;
    durations[current.id] = video.duration;
    var node = list.querySelector('[data-duration="' + current.id + '"]');
    if (node) node.textContent = video.duration.toFixed(1) + ' s';
    clock.textContent = video.currentTime.toFixed(1) + ' / ' + video.duration.toFixed(1) + ' s';
  });
  video.addEventListener('play',function () { toggle.textContent = '暂停'; toggle.setAttribute('aria-label','暂停视频'); status.textContent = '静音循环 / ' + timing(); });
  video.addEventListener('pause',function () { toggle.textContent = '播放'; toggle.setAttribute('aria-label','播放视频'); if (current) status.textContent = '已暂停 / ' + timing(); });
  video.addEventListener('error',function () { if (current) status.textContent = '录像暂时无法加载，请选择其他片段。'; });
  function motionChanged() {
    video.autoplay = !reducedMotion.matches;
    if (reducedMotion.matches) video.pause();
  }
  if (reducedMotion.addEventListener) reducedMotion.addEventListener('change', motionChanged);
  window.addEventListener('popstate', readURL);
  readURL();
})();
