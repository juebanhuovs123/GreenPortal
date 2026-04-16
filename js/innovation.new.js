document.addEventListener('DOMContentLoaded', () => {
  initFeatureHeroSliders();

  const pipeDemo = document.querySelector('[data-pipe-demo]');
  if (pipeDemo) {
    initPipeDemo(pipeDemo);
  }

  const visionDemo = document.querySelector('[data-vision-demo]');
  if (visionDemo) {
    initVisionDemo(visionDemo);
  }
});

function initFeatureHeroSliders() {
  if (typeof Swiper === 'undefined') {
    return;
  }

  document.querySelectorAll('.feature-hero-slider').forEach((slider) => {
    if (slider.classList.contains('swiper-initialized')) {
      return;
    }

    new Swiper(slider, {
      loop: true,
      speed: 1200,
      effect: 'fade',
      fadeEffect: {
        crossFade: true
      },
      autoplay: {
        delay: 5600,
        disableOnInteraction: false
      },
      pagination: {
        el: slider.querySelector('.swiper-pagination'),
        clickable: true
      }
    });
  });
}

function initPipeDemo(root) {
  const modeField = root.querySelector('[data-pipe-mode]');
  const districtField = root.querySelector('[data-pipe-district]');
  const assetField = root.querySelector('[data-pipe-asset]');
  const rainfallField = root.querySelector('[data-pipe-rainfall]');
  const runButton = root.querySelector('[data-pipe-run]');

  const districts = {
    '东湖高新区': { online: '98.6%', alarms: '2 项', orders: '5 单', pressure: '0.36 MPa', assets: '213 处' },
    '汉阳滨江片区': { online: '97.8%', alarms: '3 项', orders: '7 单', pressure: '0.34 MPa', assets: '185 处' },
    '临空港工业园': { online: '99.1%', alarms: '1 项', orders: '4 单', pressure: '0.39 MPa', assets: '246 处' }
  };

  const modes = {
    overview: {
      title: '全景监测',
      summary: '汇聚 GIS、SCADA、视频与工单数据，形成片区运行态势、告警分布和重点资产在线透视。',
      tags: ['全景监控', '资产在线', '数字孪生'],
      alerts: [
        { tone: 'warn', title: '液位波动', text: '雨后 2 号支线液位抬升，建议联动泵站预排。' },
        { tone: 'success', title: '设备在线', text: '泵站与井盖传感节点均保持在线，通信正常。' }
      ],
      actions: [
        { tone: 'success', title: '地图联动巡检', text: '生成高风险井段清单，自动推送至移动端。' },
        { tone: 'warn', title: '视频复核', text: '建议对重点井口启用 AI 视频巡查联动。' }
      ]
    },
    risk: {
      title: '风险预警',
      summary: '基于淤积、液位、水质和历史工单输出风险等级与处置优先级，减少突发事件。',
      tags: ['风险评分', '淤积预警', '优先处置'],
      alerts: [
        { tone: 'danger', title: '高风险管段', text: '连续 3 次液位异常，疑似存在局部堵塞或渗漏。' },
        { tone: 'warn', title: '雨污混接疑点', text: '水质指标与流量曲线偏离历史模型，需要现场复核。' }
      ],
      actions: [
        { tone: 'success', title: '生成应急工单', text: '自动创建排查任务，指派班组与到场时限。' },
        { tone: 'warn', title: '推荐检修窗口', text: '建议避开晚高峰，在低流量时段组织处置。' }
      ]
    },
    workorder: {
      title: '工单联动',
      summary: '把告警、巡检、检修和闭环评价串联成一条业务链路，保证响应速度和过程留痕。',
      tags: ['工单闭环', '班组协同', '过程留痕'],
      alerts: [
        { tone: 'warn', title: '待派发任务', text: '现场巡检上报 2 条异常，等待班组派发。' },
        { tone: 'success', title: '闭环率提升', text: '本周高优工单平均处置时长较上周缩短 18%。' }
      ],
      actions: [
        { tone: 'success', title: '班组智能推荐', text: '按距离、技能和负荷分配最优作业班组。' },
        { tone: 'warn', title: '材料预占用', text: '提前锁定备件与车辆，减少现场二次往返。' }
      ]
    }
  };

  function renderPipeDemo() {
    const district = districts[districtField.value] || districts['东湖高新区'];
    const mode = modes[modeField.value] || modes.overview;
    const assetName = assetField.value.trim() || '主干管网';
    const rainfall = Number(rainfallField.value || 0);
    const rainfallLabel = rainfall > 0 ? `，当前雨量 ${rainfall} mm` : '';

    setText(root, '[data-pipe-title]', `${districtField.value}${assetName}${mode.title}`);
    setText(root, '[data-pipe-summary]', `${mode.summary} 当前纳管资产 ${district.assets}${rainfallLabel}。`);
    setText(root, '[data-pipe-online]', district.online);
    setText(root, '[data-pipe-alarms]', district.alarms);
    setText(root, '[data-pipe-orders]', district.orders);
    setText(root, '[data-pipe-pressure]', district.pressure);

    renderTags(root.querySelector('[data-pipe-tags]'), [...mode.tags, districtField.value, assetName]);
    renderResultList(root.querySelector('[data-pipe-alerts]'), mode.alerts);
    renderResultList(root.querySelector('[data-pipe-actions]'), mode.actions);
  }

  runButton.addEventListener('click', renderPipeDemo);
  renderPipeDemo();
}

function initVisionDemo(root) {
  const input = root.querySelector('[data-vision-input]');
  const dropzone = root.querySelector('[data-upload-zone]');
  const modeField = root.querySelector('[data-vision-mode]');
  const runButton = root.querySelector('[data-vision-run]');
  const fileMeta = root.querySelector('[data-vision-file]');
  const emptyState = root.querySelector('[data-vision-empty]');
  const image = root.querySelector('[data-vision-image]');
  const video = root.querySelector('[data-vision-video]');
  const markers = root.querySelector('[data-vision-markers]');
  const sampleCards = Array.from(root.querySelectorAll('[data-vision-sample]'));

  let currentAsset = null;
  let currentUrl = '';

  const libraries = {
    safety: {
      title: '安全巡检识别',
      summary: '识别人员防护、围挡完整性、警示标识和积水等现场安全要素。',
      tags: ['安全帽', '反光衣', '围挡', '警示牌', '积水点'],
      findings: [
        { tone: 'success', title: '人员防护识别', text: '已识别作业人员与 PPE 穿戴状态。' },
        { tone: 'warn', title: '临边提示', text: '建议复核围挡连续性与警示区完整性。' },
        { tone: 'danger', title: '风险点提示', text: '画面中存在需要进一步确认的风险源。' }
      ]
    },
    pipe: {
      title: '管网构件识别',
      summary: '面向井盖、检查井、管口、液位和沉积迹象做快速识别，辅助巡检研判。',
      tags: ['井盖', '检查井', '液位', '沉积物', '渗漏痕迹', '警戒线'],
      findings: [
        { tone: 'success', title: '构件定位', text: '已识别关键管网构件，并输出位置标记。' },
        { tone: 'warn', title: '液位异常线索', text: '局部区域存在水位偏高或堆积迹象。' },
        { tone: 'danger', title: '缺陷复核建议', text: '建议结合现场巡检确认是否存在破损或错口。' }
      ]
    },
    quality: {
      title: '作业质量识别',
      summary: '对工地文明、设备摆放、清检修过程和场地恢复状态进行演示识别。',
      tags: ['设备摆放', '作业面恢复', '现场整洁', '临时围挡', '污泥清理'],
      findings: [
        { tone: 'success', title: '作业面识别', text: '已提取设备与作业区域基础元素。' },
        { tone: 'warn', title: '恢复状态建议', text: '建议核对地面恢复、清扫和围挡收口情况。' },
        { tone: 'danger', title: '复核任务建议', text: '如用于验收，建议联动人工复核和拍照留档。' }
      ]
    }
  };

  function revokeCurrentUrl() {
    if (currentUrl) {
      URL.revokeObjectURL(currentUrl);
      currentUrl = '';
    }
  }

  function resetPreview() {
    markers.innerHTML = '';
    image.hidden = true;
    video.hidden = true;
    image.removeAttribute('src');
    video.removeAttribute('src');
    emptyState.hidden = false;
  }

  function clearSampleState() {
    sampleCards.forEach((card) => card.classList.remove('active'));
  }

  function updatePreview(asset) {
    revokeCurrentUrl();
    markers.innerHTML = '';

    let previewSrc = '';
    if (asset.source === 'upload') {
      currentUrl = URL.createObjectURL(asset.file);
      previewSrc = currentUrl;
    } else {
      previewSrc = asset.src;
    }

    fileMeta.textContent = `${asset.name} · ${formatFileSize(asset.size)} · ${asset.type.startsWith('video/') ? '视频' : '图片'}`;
    emptyState.hidden = true;

    if (asset.type.startsWith('video/')) {
      video.src = previewSrc;
      video.hidden = false;
      image.hidden = true;
    } else {
      image.src = previewSrc;
      image.hidden = false;
      video.hidden = true;
    }
  }

  function setCurrentAsset(asset) {
    currentAsset = asset;
    updatePreview(asset);

    setText(root, '[data-vision-title]', `${asset.source === 'sample' ? '内置样例' : '文件'}已载入，等待识别`);
    setText(root, '[data-vision-summary]', asset.source === 'sample'
      ? '你可以直接开始识别，也可以切换识别场景后再运行演示。'
      : '请选择试用场景并开始识别，当前为演示模式输出。');
    renderTags(root.querySelector('[data-vision-tags]'), asset.tags || []);
    renderResultList(root.querySelector('[data-vision-findings]'), []);
    setText(root, '[data-vision-risk]', '--');
    setText(root, '[data-vision-targets]', '--');
    setText(root, '[data-vision-format]', asset.type.startsWith('video/') ? '视频' : '图片');
    setText(root, '[data-vision-scene]', '--');
  }

  function handleFile(file) {
    if (!file || (!file.type.startsWith('image/') && !file.type.startsWith('video/'))) {
      return;
    }

    clearSampleState();
    setCurrentAsset({
      source: 'upload',
      name: file.name,
      size: file.size || 0,
      type: file.type || 'application/octet-stream',
      file,
      tags: []
    });
  }

  function handleSample(card) {
    const sampleMode = card.dataset.sampleMode || 'pipe';
    modeField.value = sampleMode;
    clearSampleState();
    card.classList.add('active');

    setCurrentAsset({
      source: 'sample',
      name: card.dataset.sampleName || '内置样例',
      size: Number(card.dataset.sampleSize || 420 * 1024),
      type: card.dataset.sampleType || 'image/png',
      src: card.dataset.sampleSrc,
      tags: splitTags(card.dataset.sampleTags)
    });
  }

  function runAnalysis() {
    if (!currentAsset) {
      setText(root, '[data-vision-title]', '请先选择内置样例或上传文件');
      setText(root, '[data-vision-summary]', '支持内置图片样例、图片上传和视频上传演示。');
      return;
    }

    const modeKey = modeField.value;
    const library = libraries[modeKey] || libraries.safety;
    const seed = hashString(`${currentAsset.name}-${currentAsset.type}-${modeKey}-${currentAsset.size}-${currentAsset.source}`);
    const tags = pickItems(uniqueItems([...(currentAsset.tags || []), ...library.tags]), 4, seed);
    const findings = library.findings.map((item) => ({
      tone: item.tone,
      title: item.title,
      text: `${item.text}${currentAsset.source === 'sample'
        ? ' 当前为内置样例演示输出。'
        : currentAsset.type.startsWith('video/')
          ? ' 当前按视频关键帧进行演示识别。'
          : ' 当前按图像静态识别进行演示。'}`
    }));
    const riskLevels = ['低风险', '中风险', '需复核'];
    const targets = currentAsset.type.startsWith('video/')
      ? `${3 + (seed % 4)} 个关键目标`
      : `${2 + (seed % 3)} 个识别目标`;
    const summary = `${library.summary} 当前文件为${currentAsset.type.startsWith('video/') ? '视频' : '图片'}，系统已生成演示标签、目标数量和复核建议。`;

    markers.innerHTML = '';
    createMarkers(markers, tags.slice(0, currentAsset.type.startsWith('video/') ? 3 : 2), seed);

    runButton.disabled = true;
    runButton.textContent = '识别中...';

    window.setTimeout(() => {
      setText(root, '[data-vision-title]', `${library.title}结果已生成`);
      setText(root, '[data-vision-summary]', summary);
      setText(root, '[data-vision-risk]', riskLevels[seed % riskLevels.length]);
      setText(root, '[data-vision-targets]', targets);
      setText(root, '[data-vision-format]', currentAsset.type.startsWith('video/') ? '视频' : '图片');
      setText(root, '[data-vision-scene]', library.title);
      renderTags(root.querySelector('[data-vision-tags]'), tags);
      renderResultList(root.querySelector('[data-vision-findings]'), findings);

      runButton.disabled = false;
      runButton.textContent = '开始识别';
    }, 700);
  }

  dropzone.addEventListener('dragover', (event) => {
    event.preventDefault();
    dropzone.classList.add('is-dragover');
  });

  dropzone.addEventListener('dragleave', () => {
    dropzone.classList.remove('is-dragover');
  });

  dropzone.addEventListener('drop', (event) => {
    event.preventDefault();
    dropzone.classList.remove('is-dragover');
    handleFile(event.dataTransfer.files[0]);
  });

  input.addEventListener('change', () => {
    handleFile(input.files[0]);
  });

  sampleCards.forEach((card) => {
    card.addEventListener('click', () => handleSample(card));
  });

  runButton.addEventListener('click', runAnalysis);

  if (sampleCards[0]) {
    handleSample(sampleCards[0]);
  } else {
    resetPreview();
  }
}

function renderTags(container, tags) {
  if (!container) {
    return;
  }

  container.innerHTML = '';
  tags.forEach((tag) => {
    const span = document.createElement('span');
    span.className = 'chip';
    span.textContent = tag;
    container.appendChild(span);
  });
}

function renderResultList(container, items) {
  if (!container) {
    return;
  }

  container.innerHTML = '';

  if (!items.length) {
    const empty = document.createElement('div');
    empty.className = 'result-item';
    empty.innerHTML = '<strong>等待结果</strong><p>运行演示后，这里会展示识别结论与处置建议。</p>';
    container.appendChild(empty);
    return;
  }

  items.forEach((item) => {
    const card = document.createElement('div');
    const title = document.createElement('strong');
    const text = document.createElement('p');

    card.className = `result-item ${item.tone || ''}`.trim();
    title.textContent = item.title;
    text.textContent = item.text;

    card.appendChild(title);
    card.appendChild(text);
    container.appendChild(card);
  });
}

function createMarkers(container, labels, seed) {
  const positions = [
    { x: 22, y: 28 },
    { x: 68, y: 32 },
    { x: 54, y: 62 },
    { x: 32, y: 72 }
  ];

  labels.forEach((label, index) => {
    const marker = document.createElement('div');
    const pos = positions[(seed + index) % positions.length];
    marker.className = 'vision-marker';
    marker.style.left = `${pos.x}%`;
    marker.style.top = `${pos.y}%`;
    marker.textContent = label;
    container.appendChild(marker);
  });
}

function pickItems(list, count, seed) {
  if (!list.length) {
    return [];
  }

  const picked = [];
  for (let i = 0; i < list.length && picked.length < count; i += 1) {
    const item = list[(seed + i * 3) % list.length];
    if (!picked.includes(item)) {
      picked.push(item);
    }
  }
  return picked;
}

function uniqueItems(list) {
  return list.filter((item, index) => list.indexOf(item) === index);
}

function splitTags(value) {
  if (!value) {
    return [];
  }

  return value
    .split('|')
    .map((item) => item.trim())
    .filter(Boolean);
}

function hashString(value) {
  return Array.from(value).reduce((sum, char, index) => sum + (char.charCodeAt(0) * (index + 1)), 0);
}

function formatFileSize(size) {
  if (size >= 1024 * 1024) {
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  }
  return `${Math.max(1, Math.round(size / 1024))} KB`;
}

function setText(root, selector, text) {
  const el = root.querySelector(selector);
  if (el) {
    el.textContent = text;
  }
}
