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
  const media = root.querySelector('[data-vision-media]');
  const image = root.querySelector('[data-vision-image]');
  const video = root.querySelector('[data-vision-video]');
  const boxes = root.querySelector('[data-vision-boxes]');
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

  const samplePresets = {
    well_guard: {
      title: '井口防护隐患识别',
      summary: '样例聚焦井口防护缺失、围挡不足和人员靠近井口等高风险安全问题，适合做现场安全巡检演示。',
      tags: ['井口未设护栏', '围挡不足', '井盖基础松动', '坠落风险'],
      findings: [
        { tone: 'danger', title: '井口防护不足', text: '井口未设置标准防护栏杆，临边防护明显缺失。' },
        { tone: 'warn', title: '围挡未形成有效隔离', text: '钢筋网未形成有效围挡，无法起到稳定防护作用。' },
        { tone: 'warn', title: '井盖边缘存在松动风险', text: '井盖边缘与基础不密实，建议立即复核并加固。' },
        { tone: 'danger', title: '人员靠近高风险区域', text: '人员活动范围已接近井口边缘，存在坠落风险。' }
      ],
      risk: '高风险',
      targets: '4 个风险点',
      scene: '安全巡检识别'
    },
    weld_joint: {
      title: '钢筋焊接缺陷识别',
      summary: '样例聚焦焊接接头、钢筋绑扎和支撑稳定性问题，适合做施工质量与安全联合识别演示。',
      tags: ['焊渣未清理', '焊接烧伤', '绑扎松动', '支撑不稳'],
      findings: [
        { tone: 'warn', title: '焊接接头质量异常', text: '焊接接头存在烧伤痕迹，焊渣残留较明显。' },
        { tone: 'warn', title: '钢筋绑扎不规范', text: '局部钢筋绑扎不牢，铁丝松动，影响构件连接稳定性。' },
        { tone: 'danger', title: '支撑体系稳定不足', text: '支撑梁存在晃动和受力不均迹象，建议尽快复核。' },
        { tone: 'warn', title: '压重块未固定', text: '混凝土压重块未可靠固定，存在掉落或碰撞风险。' }
      ],
      risk: '中高风险',
      targets: '4 个缺陷点',
      scene: '作业质量识别'
    },
    formwork_cleanup: {
      title: '拆模后文明施工识别',
      summary: '样例聚焦浆液残留、杂物堆积和钢筋头外露问题，适合做拆模后文明施工与作业面恢复演示。',
      tags: ['浆液残留', '地面湿滑', '杂物堆积', '钢筋头外露'],
      findings: [
        { tone: 'warn', title: '浆液残留未清理', text: '模板拆除后残留混凝土浆液未及时清理，地面湿滑。' },
        { tone: 'warn', title: '杂物堆积影响通行', text: '现场杂物堆积，存在交叉作业绊倒风险。' },
        { tone: 'danger', title: '钢筋头外露', text: '地面散落钢筋头，存在刺伤和划伤风险。' }
      ],
      risk: '中高风险',
      targets: '3 个风险点',
      scene: '作业质量识别'
    }
  };

  const realImagePresets = {
    open_well: {
      title: '井筒敞口隐患识别',
      summary: '样例聚焦井筒敞口、缺少盖板、井壁拼缝异常和井内积水问题，适合做有限空间周边安全巡检演示。',
      tags: ['井口敞开', '缺少盖板', '井壁拼缝异常', '井内积水'],
      findings: [
        { tone: 'danger', title: '井口敞开未封闭', text: '井筒处于敞开状态，未见标准盖板或围护措施，存在坠落风险。' },
        { tone: 'warn', title: '井壁拼缝需复核', text: '井壁拼缝不均匀，建议结合现场施工记录复核井筒成型质量。' },
        { tone: 'warn', title: '井内存在积水', text: '井内存在明显积水，后续作业前应先确认排水和安全通风条件。' }
      ],
      risk: '高风险',
      targets: '4 个风险点',
      scene: '安全巡检识别',
      detections: [
        { x: 7, y: 5, w: 79, h: 82, tone: 'danger', label: '井口敞开未封闭，存在人员坠落风险' },
        { x: 19, y: 16, w: 47, h: 47, tone: 'warn', label: '井壁拼缝不均，建议复核井筒施工质量' },
        { x: 31, y: 44, w: 22, h: 18, tone: '', label: '井内积水滞留，作业前需先排查积水' },
        { x: 66, y: 10, w: 24, h: 72, tone: 'warn', label: '井口外侧土体松散，临边作业需加强防护' }
      ]
    },
    rebar_grate: {
      title: '洞口钢筋盖网隐患识别',
      summary: '样例聚焦洞口未封闭、钢筋临时覆盖和临边坠落风险，适合做土建阶段安全巡检演示。',
      tags: ['洞口未封闭', '钢筋临时覆盖', '临边防护缺失', '坠落风险'],
      findings: [
        { tone: 'danger', title: '洞口未形成封闭防护', text: '洞口仅以钢筋网临时覆盖，未形成标准盖板或封闭措施。' },
        { tone: 'warn', title: '钢筋间隙过大', text: '钢筋网间隙较大，无法替代标准防护盖板，存在人材坠落风险。' },
        { tone: 'warn', title: '洞口边缘需加固', text: '洞口边缘混凝土存在破损和裸露，建议同步完成边缘修整与警示围护。' }
      ],
      risk: '高风险',
      targets: '4 个风险点',
      scene: '安全巡检识别',
      detections: [
        { x: 9, y: 10, w: 82, h: 79, tone: '', label: '洞口仅以钢筋临时覆盖，未形成有效封闭防护' },
        { x: 18, y: 17, w: 58, h: 58, tone: 'danger', label: '大开口区域未设标准盖板或护栏' },
        { x: 13, y: 17, w: 70, h: 61, tone: 'warn', label: '钢筋间隙较大，人员与物料坠落风险高' },
        { x: 5, y: 65, w: 28, h: 17, tone: 'warn', label: '洞口边缘破损，需加固并设置临边警示' }
      ]
    },
    well_guard: {
      title: '井口防护隐患识别',
      summary: '样例聚焦井口防护、围挡不足和人员临边风险，适合做现场安全巡检演示。',
      tags: ['井口未设护栏', '围挡不足', '井盖边缘松动', '人员临边'],
      findings: [
        { tone: 'danger', title: '井口防护不足', text: '井口周边未形成标准化防护，存在人员坠落风险。' },
        { tone: 'warn', title: '钢筋网围挡不足', text: '临时钢筋网未形成有效隔离，防护作用有限。' },
        { tone: 'warn', title: '井盖边缘密实度不足', text: '井盖与基础边缘存在松动和不密实现象。' },
        { tone: 'danger', title: '人员靠近井口', text: '人员活动范围已靠近井口区域，应立即加强警戒。' }
      ],
      risk: '高风险',
      targets: '4 个风险点',
      scene: '安全巡检识别',
      detections: [
        { x: 6, y: 6, w: 84, h: 86, tone: 'info', label: '钢筋网围挡未形成有效防护' },
        { x: 18, y: 16, w: 61, h: 66, tone: 'danger', label: '井口未设置标准防护栏杆' },
        { x: 28, y: 21, w: 41, h: 38, tone: 'warn', label: '井盖边缘与基础不密实，可能松动' },
        { x: 78, y: 73, w: 17, h: 22, tone: 'success', label: '人员靠近井口，存在坠落风险' }
      ]
    },
    weld_joint: {
      title: '钢筋焊接缺陷识别',
      summary: '样例聚焦焊接接头、焊渣残留、绑扎松动和支撑稳定性问题，适合做施工质量演示。',
      tags: ['焊接烧伤', '焊渣残留', '绑扎松动', '支撑不稳'],
      findings: [
        { tone: 'warn', title: '焊接接头异常', text: '焊接接头存在烧伤痕迹，焊渣残留明显。' },
        { tone: 'warn', title: '绑扎不规范', text: '局部铁丝绑扎松动，影响构件连接稳定性。' },
        { tone: 'danger', title: '支撑体系稳定不足', text: '支撑梁受力与稳定性表现异常，建议立即复核。' },
        { tone: 'warn', title: '压重块未固定', text: '压重块存在掉落或碰撞风险，需要加固。' }
      ],
      risk: '中高风险',
      targets: '4 个缺陷点',
      scene: '作业质量识别',
      detections: [
        { x: 1, y: 16, w: 29, h: 36, tone: 'info', label: '混凝土块随压重未固定，存在坠落风险' },
        { x: 36, y: 12, w: 61, h: 18, tone: 'warn', label: '焊接接头存在烧伤，焊渣未清理' },
        { x: 10, y: 35, w: 32, h: 30, tone: 'success', label: '钢筋绑扎不规范，铁丝松动' },
        { x: 18, y: 47, w: 47, h: 32, tone: 'info', label: '支撑梁晃动明显，稳定性不足' }
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
    boxes.innerHTML = '';
    media.hidden = true;
    image.hidden = true;
    video.hidden = true;
    video.controls = false;
    image.removeAttribute('src');
    video.removeAttribute('src');
    video.pause();
    video.load();
    emptyState.hidden = false;
  }

  function clearSampleState() {
    sampleCards.forEach((card) => card.classList.remove('active'));
  }

  function updatePreview(asset) {
    revokeCurrentUrl();
    boxes.innerHTML = '';

    let previewSrc = '';
    if (asset.source === 'upload') {
      currentUrl = URL.createObjectURL(asset.file);
      previewSrc = currentUrl;
    } else {
      previewSrc = asset.src;
    }

    fileMeta.textContent = `${asset.name} · ${formatFileSize(asset.size)} · ${asset.type.startsWith('video/') ? '视频' : '图片'}`;
    emptyState.hidden = true;
    media.hidden = false;

    if (asset.type.startsWith('video/')) {
      video.src = previewSrc;
      video.controls = true;
      video.load();
      video.hidden = false;
      image.hidden = true;
      image.removeAttribute('src');
    } else {
      image.src = previewSrc;
      image.hidden = false;
      video.pause();
      video.hidden = true;
      video.controls = false;
      video.removeAttribute('src');
      video.load();
    }
  }

  function setCurrentAsset(asset) {
    currentAsset = asset;
    updatePreview(asset);
    const samplePreset = asset.sampleKey ? (realImagePresets[asset.sampleKey] || samplePresets[asset.sampleKey]) : null;

    setText(root, '[data-vision-title]', `${asset.source === 'sample' ? '原图样例' : '文件'}已载入，等待识别`);
    setText(root, '[data-vision-summary]', asset.source === 'sample'
      ? `${samplePreset ? samplePreset.summary : '你可以直接开始识别。'} 点击“开始识别”后，系统会自动框出隐患位置。`
      : '请选择试用场景并开始识别，系统会以演示模式自动框出疑似隐患位置。');
    renderTags(root.querySelector('[data-vision-tags]'), asset.tags || (samplePreset ? samplePreset.tags : []));
    renderResultList(root.querySelector('[data-vision-findings]'), []);
    setText(root, '[data-vision-risk]', '--');
    setText(root, '[data-vision-targets]', '--');
    setText(root, '[data-vision-format]', asset.type.startsWith('video/') ? '视频' : '图片');
    setText(root, '[data-vision-scene]', samplePreset ? samplePreset.scene : '--');
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
      tags: splitTags(card.dataset.sampleTags),
      sampleKey: card.dataset.sampleKey || ''
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
    const preset = currentAsset.sampleKey
      ? (realImagePresets[currentAsset.sampleKey] || samplePresets[currentAsset.sampleKey])
      : null;
    const seed = hashString(`${currentAsset.name}-${currentAsset.type}-${modeKey}-${currentAsset.size}-${currentAsset.source}`);
    const tags = preset
      ? preset.tags
      : pickItems(uniqueItems([...(currentAsset.tags || []), ...library.tags]), 4, seed);
    const findings = (preset ? preset.findings : library.findings).map((item) => ({
      tone: item.tone,
      title: item.title,
      text: `${item.text}${currentAsset.source === 'sample'
        ? ' 当前为内置样例演示输出。'
        : currentAsset.type.startsWith('video/')
          ? ' 当前按视频关键帧进行演示识别。'
          : ' 当前按图像静态识别进行演示。'}`
    }));
    const riskLevels = ['低风险', '中风险', '需复核'];
    const targets = preset
      ? preset.targets
      : currentAsset.type.startsWith('video/')
        ? `${3 + (seed % 4)} 个关键目标`
        : `${2 + (seed % 3)} 个识别目标`;
    const summary = preset
      ? `${preset.summary} 当前为原图自动识别演示，已按样例预设框出隐患位置。`
      : `${library.summary} 当前文件为${currentAsset.type.startsWith('video/') ? '视频' : '图片'}，系统已生成演示标签、目标数量和复核建议。`;
    const sceneLabel = preset ? preset.scene : library.title;
    const titleLabel = preset ? preset.title : library.title;
    const riskLabel = preset ? preset.risk : riskLevels[seed % riskLevels.length];
    const detections = preset && Array.isArray(preset.detections) && preset.detections.length
      ? preset.detections
      : buildGenericDetections(tags, seed, currentAsset.type.startsWith('video/'));

    boxes.innerHTML = '';

    runButton.disabled = true;
    runButton.textContent = '识别中...';

    window.setTimeout(() => {
      setText(root, '[data-vision-title]', `${titleLabel}结果已生成`);
      setText(root, '[data-vision-summary]', summary);
      setText(root, '[data-vision-risk]', riskLabel);
      setText(root, '[data-vision-targets]', targets);
      setText(root, '[data-vision-format]', currentAsset.type.startsWith('video/') ? '视频' : '图片');
      setText(root, '[data-vision-scene]', sceneLabel);
      renderTags(root.querySelector('[data-vision-tags]'), tags);
      renderResultList(root.querySelector('[data-vision-findings]'), findings);
      renderDetectionBoxes(boxes, detections);

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

function renderDetectionBoxes(container, detections) {
  if (!container) {
    return;
  }

  container.innerHTML = '';

  detections.forEach((item) => {
    const box = document.createElement('div');
    const label = document.createElement('span');

    box.className = `vision-box ${item.tone || ''}`.trim();
    box.style.left = `${item.x}%`;
    box.style.top = `${item.y}%`;
    box.style.width = `${item.w}%`;
    box.style.height = `${item.h}%`;

    label.className = 'vision-box-label';
    label.textContent = item.label;

    box.appendChild(label);
    container.appendChild(box);
  });
}

function buildGenericDetections(tags, seed, isVideo) {
  const positions = isVideo
    ? [
        { x: 10, y: 16, w: 26, h: 24 },
        { x: 46, y: 18, w: 34, h: 20 },
        { x: 24, y: 48, w: 42, h: 26 },
        { x: 68, y: 58, w: 18, h: 20 }
      ]
    : [
        { x: 12, y: 14, w: 32, h: 28 },
        { x: 52, y: 18, w: 24, h: 24 },
        { x: 20, y: 52, w: 38, h: 24 },
        { x: 62, y: 60, w: 22, h: 18 }
      ];
  const tones = ['warn', 'danger', 'success', ''];
  const labels = tags.length ? tags : ['疑似异常', '建议复核'];
  const count = Math.min(positions.length, Math.max(isVideo ? 3 : 2, labels.length));

  return Array.from({ length: count }, (_, index) => {
    const position = positions[(seed + index) % positions.length];
    const label = labels[index % labels.length];
    return {
      ...position,
      tone: tones[(seed + index) % tones.length],
      label: `${label}${label.includes('风险') || label.includes('隐患') ? '' : '疑似异常'}`
    };
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
