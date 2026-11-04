(function () {
  'use strict';
  var root = document.getElementById('gallery');
  if (!root) return;
  var clips = [
    {id:'panda-v7',robot:'panda',task:'mug_hang',label:'Dyna',plain:'panda_mug_v7_final',poster:'panda_mug_v7_final'},
    {id:'panda-teacher',robot:'panda',task:'mug_hang',label:'Teacher',success:79.3,plain:'panda_mug_teacher_s0',hud:'teacher_hud',poster:'panda_mug_teacher_s0',posterHud:'teacher_hud',note:'Plain and HUD are separate recorded episodes, not a synchronized comparison.'},
    {id:'panda-bc',robot:'panda',task:'mug_hang',label:'BC',plain:'panda_mug_v7_bc_init',poster:'panda_mug_v7_bc_init'},
    {id:'arx5-teacher',robot:'arx5',task:'mug_hang',label:'Teacher',success:97.7,plain:'teacher',poster:'teacher'},
    {id:'piper-teacher',robot:'piper',task:'mug_hang',label:'Teacher',success:46.1,hud:'verified_20261104/teacher_hud',posterHud:'verified_20261104/teacher_hud',duration:6.45,realTime:true,note:'Selected successful episode, seed 200042. The opening approach is retained; this clip is not the 256-episode evaluation.'},
    {id:'ur5e-teacher',robot:'ur5e',task:'mug_hang',label:'Teacher',success:62.5,hud:'verified_20261104/teacher_hud',posterHud:'verified_20261104/teacher_hud',duration:8.95,realTime:true,note:'Robotiq-inspired prismatic approximation: linkage parts are omitted in this simulation model, not hidden by the camera.'},
    {id:'xarm7-teacher',robot:'xarm7',task:'mug_hang',label:'Teacher',success:46.5,hud:'verified_20261104/teacher_hud',posterHud:'verified_20261104/teacher_hud',duration:8.4,realTime:true,note:'Simulated xArm gripper uses a prismatic approximation. Selected episode; benchmark success is measured separately.'},
    {id:'piper-lemon',robot:'piper',task:'lemon',label:'Teacher',success:99.2,hud:'teacher_hud',posterHud:'teacher_hud',note:'Pipeline acceptance task. Legacy recording timing has not been corrected.'}
  ];
  var robots = {panda:'Panda',arx5:'ARX5',piper:'PiPER',ur5e:'UR5e',xarm7:'xArm7'};
  var tasks = {mug_hang:'Mug hanging',lemon:'Lemon placement'};
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
  video.muted = true;
  video.defaultMuted = true;
  video.autoplay = true;
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
  function playback() {
    if (!current) return;
    var revision = generation;
    video.muted = true;
    var attempt = video.play();
    if (attempt && attempt.catch) attempt.catch(function (error) {
      if (revision !== generation || error.name === 'AbortError') return;
      status.textContent = 'Autoplay blocked by browser. Press Play.';
      toggle.textContent = 'Play';
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
      var text = document.createElement('span'); text.className = 'clip-text';
      var title = document.createElement('span'); title.className = 'clip-title'; title.textContent = robots[clip.robot] + ' / ' + clip.label;
      var meta = document.createElement('span'); meta.className = 'clip-meta'; meta.textContent = tasks[clip.task];
      text.appendChild(title); text.appendChild(meta); button.appendChild(text);
      var duration = document.createElement('span'); duration.className = 'clip-dur'; duration.dataset.duration = clip.id;
      var seconds = durations[clip.id] || clip.duration;
      duration.textContent = seconds ? seconds.toFixed(1) + ' s' : '';
      button.appendChild(duration);
      button.addEventListener('click', function () { select(clip); });
      list.appendChild(button);
    });
    count.textContent = available.length + (available.length === 1 ? ' clip' : ' clips');
    if (!available.length) {
      var message = document.createElement('p'); message.className = 'clips-empty';
      message.textContent = 'No recording for this selection yet. Try another task.'; list.appendChild(message);
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
    status.textContent = current.realTime ? 'Auto loop / real-time speed' : 'Auto loop / legacy capture';
    toggle.disabled = restart.disabled = seek.disabled = false;
    seek.value = 0;
    updateModes(); playback();
  }
  function select(clip) {
    current = clip; mode = clip.plain ? 'plain' : 'hud';
    caption.textContent = '';
    var name = document.createElement('span'); name.className = 'cap-robot'; name.textContent = robots[clip.robot];
    var task = document.createElement('span'); task.textContent = tasks[clip.task] + ' / ' + clip.label;
    var score = document.createElement('span'); score.className = 'cap-success'; score.textContent = typeof clip.success === 'number' ? clip.success.toFixed(1) + '% legacy mixed-reset' : 'Legacy demo / score not linked';
    caption.appendChild(name); caption.appendChild(task); caption.appendChild(score);
    context.textContent = clip.note || 'Selected simulation episode. The score is measured over 256 held-out episodes, not this clip alone.';
    renderList(); loadVideo();
  }
  function clearPlayer() {
    generation += 1; current = null; video.pause(); video.removeAttribute('src'); video.removeAttribute('poster'); video.load();
    video.hidden = true; empty.hidden = false; caption.textContent = ''; context.textContent = '';
    status.textContent = 'Choose a robot and task with a recording';
    toggle.disabled = restart.disabled = seek.disabled = true; seek.value = 0; clock.textContent = '0.0 / 0.0 s'; updateModes();
  }
  root.querySelectorAll('.filter-group').forEach(function (group) {
    group.querySelectorAll('button').forEach(function (button) {
      button.type = 'button'; button.setAttribute('aria-pressed', button.classList.contains('active') ? 'true' : 'false');
      button.addEventListener('click', function () {
        filters[group.dataset.filter] = button.dataset.value;
        group.querySelectorAll('button').forEach(function (other) {
          var active = button === other; other.classList.toggle('active',active); other.setAttribute('aria-pressed',active ? 'true' : 'false');
        });
        var available = visible();
        if (!available.length) { clearPlayer(); renderList(); }
        else if (!current || available.indexOf(current) === -1) select(available[0]);
        else renderList();
      });
    });
  });
  modes.querySelectorAll('button').forEach(function (button) {
    button.addEventListener('click',function () { if (!current || button.disabled || mode === button.dataset.mode) return; mode = button.dataset.mode; loadVideo(); });
  });
  toggle.addEventListener('click',function () { if (!current) return; if (video.paused) playback(); else video.pause(); });
  restart.addEventListener('click',function () { if (!current) return; video.currentTime = 0; playback(); });
  seek.addEventListener('input',function () { if (current && isFinite(video.duration)) video.currentTime = video.duration * Number(seek.value) / 1000; });
  video.addEventListener('timeupdate',function () {
    if (!current || !isFinite(video.duration)) return;
    seek.value = video.duration ? Math.round(1000 * video.currentTime / video.duration) : 0;
    clock.textContent = video.currentTime.toFixed(1) + ' / ' + video.duration.toFixed(1) + ' s';
  });
  video.addEventListener('loadedmetadata',function () {
    if (!current || !isFinite(video.duration)) return;
    durations[current.id] = video.duration;
    var node = list.querySelector('[data-duration="' + current.id + '"]');
    if (node) node.textContent = video.duration.toFixed(1) + ' s';
    clock.textContent = '0.0 / ' + video.duration.toFixed(1) + ' s';
  });
  video.addEventListener('play',function () { toggle.textContent = 'Pause'; toggle.setAttribute('aria-label','Pause video'); });
  video.addEventListener('pause',function () { toggle.textContent = 'Play'; toggle.setAttribute('aria-label','Play video'); });
  video.addEventListener('error',function () { if (current) status.textContent = 'Video unavailable. Select another clip.'; });
  renderList(); select(clips[0]);
})();
