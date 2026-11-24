import {aboutContent,aboutImages} from './about-content.js';
import {projectContent} from './project-content.js';

const models = [
  {asset:'model-01',en:'Stacked volumes',zh:'叠合体量'},
  {asset:'model-img_5042',en:'An open courtyard',zh:'展开的庭院'},
  {asset:'model-04',en:'A folded roof',zh:'折叠屋顶'},
  {asset:'model-09',en:'A vertical room',zh:'竖向空间'},
  {asset:'model-img_5043',en:'Along the light',zh:'沿光展开'},
  {asset:'model-05',en:'Inside and outside',zh:'内与外'},
  {asset:'model-06',en:'A light framework',zh:'轻的框架'},
  {asset:'model-11',en:'Roof and terrace',zh:'屋顶与露台'},
  {asset:'model-08',en:'Between the roofs',zh:'屋顶之间'},
  {asset:'model-10',en:'A quiet silhouette',zh:'安静的轮廓'}
];
const words={
  en:{project:'project',about:'about',journal:'journal',contact:'contact',heading:'Architectural model studies',modelLabel:'FORM / SPACE',pause:'Pause rotation',play:'Play rotation',description:'A study in volume, space and light. Drag the model or use the arrows to look around.',typeLabel:'Type',typeValue:'Architectural model',contentLabel:'Content',contentValue:'Illustrative project',disclaimer:'Project names and information are illustrative.',previous:'Previous',next:'Next',sampleLabel:'PAGE STUDY',back:'Back to the models ↗',study:'Study',captionType:'Model study · sample',subtitle:'Architecture / Model study',reduced:'Static view · reduced motion',journalBody:'Observations, sketches and work in progress.\n\nNo journal entries have been added to this sample yet.',contactBody:'We’d love to hear from you.\nSend us a message and start the conversation.\n\ncontact@shiyearchitects.com\ninstagram: shiyearch\nrednote: 石页建筑 ShiyeArchitects'},
  zh:{project:'项目',about:'关于',journal:'日志',contact:'联系',heading:'建筑模型展厅',modelLabel:'体量 / 空间',pause:'暂停转动',play:'继续转动',description:'观察体量、空间与光。左右拖动模型，或按箭头转动。',typeLabel:'类型',typeValue:'建筑模型',contentLabel:'内容',contentValue:'示例项目',disclaimer:'项目名称及信息均为示例。',previous:'上一个',next:'下一个',sampleLabel:'页面示例',back:'返回模型展厅 ↗',study:'示例',captionType:'空间模型 · 示例',subtitle:'建筑 / 模型研究',reduced:'静态展示 · 减少动态效果',journalBody:'观察、手稿与设计过程。\n\n当前样板暂未添加日志内容。',contactBody:'我们乐于交流和共同探索，\n欢迎向我们发送信息。\n\ncontact@shiyearchitects.com\ninstagram: shiyearch\nrednote: 石页建筑 ShiyeArchitects'}
};
Object.assign(words.zh,{
  back:'返回首页 ↗',projectsHeading:'项目',projectsEyebrow:'目录',
  projectsIntro:'建筑项目与空间研究示例。',journalHeading:'日志',
  previousPhoto:'上一张照片',nextPhoto:'下一张照片',photoThumbnails:'照片缩略图',
  zoomPhoto:'放大照片',photoPreview:'照片预览',homeSample:'示例',
  journalEyebrow:'观察与过程',journalIntro:'观察、手稿与设计过程。',
  journalEmpty:'内容整理中。',contactHeading:'联系',contactEyebrow:'交流与合作',
  news:'新闻',newsHeading:'新闻',newsEyebrow:'新闻与动态',newsEmpty:'内容整理中。'
});
Object.assign(words.en,{
  back:'Back to home ↗',projectsHeading:'Projects',projectsEyebrow:'CONTENTS',
  projectsIntro:'Built projects and illustrative model studies.',journalHeading:'Journal',
  previousPhoto:'Previous photo',nextPhoto:'Next photo',photoThumbnails:'Photo thumbnails',
  zoomPhoto:'Enlarge photo',photoPreview:'Photo preview',homeSample:'Sample',
  journalEyebrow:'OBSERVATIONS / PROCESS',journalIntro:'Observations, sketches and design process.',
  journalEmpty:'Content in preparation.',contactHeading:'Contact',contactEyebrow:'ENQUIRIES / COLLABORATION',
  news:'news',newsHeading:'News',newsEyebrow:'NEWS / UPDATES',newsEmpty:'Content in preparation.'
});
let language='zh', activeCard=null, detailIndex=0, currentPage='home';
let viewer=null, viewerPromise=null, requestId=0, detailState='idle';
let photoIndex = 0;
let projectOpener = null;
let projectClosedByPointer = false;
const projectReturnKey = asset => `shiye:project-return:${asset}`;
const nonnegative = value => Number.isFinite(value) && value >= 0 ? value : 0;
function readProjectReturn(asset) {
  try {
    const saved = JSON.parse(sessionStorage.getItem(projectReturnKey(asset)));
    return [1, 2, 3].includes(saved?.version) && saved.asset === asset ? saved : null;
  } catch { return null; }
}
const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)');
const fineHover=matchMedia('(hover: hover) and (pointer: fine)');
const catalogHover = matchMedia('(min-width: 641px) and (any-hover: hover) and (any-pointer: fine)');
const grid=document.querySelector('#model-grid');
const mainContent = document.querySelector('#main-content');
const homeGallery = document.querySelector('.home-gallery');
const siteHeader = document.querySelector('.site-header');
const mainNavigation = siteHeader.querySelector('.navigation');
const projectNavBar = document.querySelector('.project-nav-bar');
const projectHeader = siteHeader.cloneNode(true);
const projectNavigation = projectHeader.querySelector('.navigation');
projectHeader.querySelector('#language-toggle').removeAttribute('id');
projectNavBar.append(projectHeader);
const languageToggles = document.querySelectorAll('.navigation .language-button');
function measureSiteHeader() {
  const {height} = siteHeader.getBoundingClientRect();
  document.body.style.setProperty('--site-header-height', `${height}px`);
}
new ResizeObserver(measureSiteHeader).observe(siteHeader);
const aboutPage=document.querySelector('#about-page');
const pageSections={
  projects:document.querySelector('#projects-page'),about:aboutPage,
  journal:document.querySelector('#journal-page'),news:document.querySelector('#news-page'),contact:document.querySelector('#contact-page')
};
const projectIndexGrid=document.querySelector('#project-index-grid');
const projectIndexScroll = projectIndexGrid.parentElement;
const projectDirectory = document.querySelector('.project-directory');
const projectCatalog = document.querySelector('.project-catalog');
const projectFeature = document.querySelector('#project-feature');
const projectFeatureOpen = document.querySelector('#project-feature-open');
const projectFeatureImage = document.querySelector('#project-feature-image');
const projectFeatureDetails = document.querySelector('#project-feature-details');
const projectImageSequence = document.querySelector('#project-image-sequence');
let projectLayout = new URLSearchParams(location.search).get('project-layout') === 'select' ? 'select' : 'scroll';
let selectedProjectIndex = 0;
const projectDialog=document.querySelector('#project-dialog');
const projectDescription = document.querySelector('#project-description');
const projectFacts = document.querySelector('#project-facts');
const projectFullLink = document.querySelector('#project-full-link');
const sampleDisclaimer = projectDialog.querySelector('.demo-disclaimer');
const detailModel = document.querySelector('#detail-model');
const detailPhoto = document.querySelector('#detail-photo');
const detailPhotoImage = document.querySelector('#detail-photo-image');
const detailPhotoZoom = document.querySelector('#detail-photo-zoom');
const detailPhotoLeft = document.querySelector('#detail-photo-left');
const detailPhotoRight = document.querySelector('#detail-photo-right');
const detailPhotoArrows = document.querySelector('#detail-photo-arrows');
const detailPhotoCredit = document.querySelector('#detail-photo-credit');
const detailPhotoThumbnails = document.querySelector('#detail-photo-thumbnails');
const detailPhotoStatus = document.querySelector('#detail-photo-status');
const photoPreview = document.querySelector('#photo-preview');
const photoPreviewImage = document.querySelector('#photo-preview-image');
const photoPreviewCount = document.querySelector('#photo-preview-count');
const photoPreviewLeft = document.querySelector('#photo-preview-left');
const photoPreviewRight = document.querySelector('#photo-preview-right');
const detailPoster=document.querySelector('#detail-poster');
const detailStage=document.querySelector('#detail-stage');
const motionToggle=document.querySelector('#motion-toggle');
const lightToggle=document.querySelector('#light-toggle');
const pad=n=>String(n).padStart(2,'0');
// Revised posters get a new immutable URL, so warm browser caches cannot show
// an older pose while the live model starts from the current one.
const posterRevisions = {
  "model-01": "model-01-courtyard-497b70acb8",
  "model-img_5042": "model-img_5042-home-1a0355e2b1",
  "model-04": "model-04-roof-a9fe6433d4",
  "model-09": "model-09-stair-4eb461aeb5",
  "model-img_5043": "model-img_5043-stair-b8a66e544b",
  "model-05": "model-05-roof-5170dc415a",
  "model-06": "model-06-canopy-gable-5eea7ba635",
  "model-11": "model-11-dormers-01d73551b0",
  "model-08": "model-08-canopy-gable-4195c524bb",
  "model-10": "model-10-garden-7d5b3c3ce5"
};
const poster=id=>`assets/home-models/${posterRevisions[id]??id}.webp`;
const labels={
  en:{loading:'Loading model…',error:'The model is unavailable. You can still browse the project.',on:'Turn lights off',off:'Turn lights on',static:'Static view',skip:'Skip to content'},
  zh:{loading:'模型载入中…',error:'模型暂时无法载入，仍可查看项目信息。',on:'关闭灯光',off:'开启灯光',static:'静态展示',skip:'跳至正文'}
};
async function showModel(host,id,onState){
  const ticket=++requestId;
  onState('loading');
  try{
    viewerPromise??=import('./home-viewer.js');
    viewer=await viewerPromise;
    if(ticket===requestId)viewer.show(host,id,onState);
  }catch(error){if(ticket===requestId)onState('error');console.warn('3D preview unavailable:',error.message);}
}
function stopModel(immediate=false){requestId++;viewer?.hide(immediate);}
function activate(card){
  if(homeGallery.hidden||activeCard===card||projectDialog.open)return;
  deactivate(true);activeCard=card;card.classList.add('is-active');
  showModel(card.querySelector('.model-object'),models[card.dataset.index].asset,state=>{
    card.dataset.modelState=state;
    card.querySelector('.model-status').textContent=state==='error'?labels[language].error:'';
  });
}
function deactivate(immediate=false){
  if(!activeCard)return;
  activeCard.classList.remove('is-active');activeCard=null;stopModel(immediate);
}
// Models without their own project use the approved case as an example.
const temporaryHomeProjectAsset = 'model-01';
const temporaryHomeProjectIndex = models.findIndex(({asset}) => asset === temporaryHomeProjectAsset);
function projectAssetForIndex(index) {
  const {asset} = models[index];
  return projectContent[asset] ? asset : temporaryHomeProjectAsset;
}
function catalogPhotoIndex(index, asset) {
  const photos = projectContent[asset]?.photos;
  return asset !== models[index].asset && photos?.length ? index % photos.length : 0;
}
models.forEach((model,index)=>{
  const button=document.createElement('button');
  button.className='model-card';button.type='button';button.dataset.index=index;
  button.dataset.model = model.asset;
  button.setAttribute('aria-haspopup','dialog');
  button.innerHTML=`<div class="model-stage"><div class="model-object"><img class="model-poster" src="${poster(model.asset)}" alt="" width="640" height="640" decoding="async" ${index>4?'loading="lazy"':''}></div></div><div class="model-caption"><span class="caption-title"></span><span class="caption-type"></span></div><span class="model-status" role="status"></span>`;
  button.addEventListener('pointerenter',()=>{if(fineHover.matches)activate(button);});
  button.addEventListener('pointerleave',()=>{if(activeCard===button&&!button.matches(':focus-visible'))deactivate();});
  button.addEventListener('focus',()=>{if(button.matches(':focus-visible'))activate(button);});
  button.addEventListener('blur',()=>{if(activeCard===button)deactivate();});
  const homeProjectIndex = projectContent[model.asset] ? index : temporaryHomeProjectIndex;
  button.addEventListener('click',()=>openProject(homeProjectIndex, button));
  grid.append(button);
  const projectButton=document.createElement('button');
  projectButton.className='project-index-card';projectButton.type='button';projectButton.dataset.index=index;
  projectButton.dataset.model = model.asset;
  projectButton.innerHTML=`<span class="project-index-name"><span class="project-index-title"></span><span class="project-index-type" hidden></span></span><span class="project-index-leader" aria-hidden="true"></span><span class="project-index-number">${pad(index+1)}</span>`;
  projectButton.addEventListener('click', () => {
    revealCatalogProject(index);
    if (projectLayout === 'scroll') openProject(index, projectButton);
  });
  projectIndexGrid.append(projectButton);
  const plate = document.createElement('figure');
  plate.className = 'project-sequence-item';
  plate.dataset.index = index;
  plate.dataset.model = model.asset;
  plate.id = `project-plate-${pad(index+1)}`;
  plate.innerHTML = `<button class="project-plate-open" type="button" data-index="${index}" aria-haspopup="dialog"><img alt="" decoding="async" ${index ? 'loading="lazy"' : ''}></button><figcaption class="project-plate-caption"><span class="project-plate-number">${pad(index+1)}</span><div class="project-plate-description"><span class="project-plate-title"></span><span class="project-plate-meta"></span></div></figcaption>`;
  const plateButton = plate.querySelector('.project-plate-open');
  plateButton.addEventListener('click', () => {
    selectCatalogProject(index);
    openProject(index, plateButton);
  });
  projectImageSequence.append(plate);
});
function catalogProject(index) {
  const model = models[index];
  const asset = projectAssetForIndex(index);
  const project = projectContent[asset];
  const details = project?.[language];
  const photo = projectContent[model.asset]?.catalogCover ?? project?.photos?.[catalogPhotoIndex(index, asset)];
  const sampleLabel = asset !== model.asset ? words[language].homeSample : '';
  return {
    title: details?.title ?? model[language],
    meta: [sampleLabel, details?.subtitle].filter(Boolean).join(' · '),
    sampleLabel,
    src: photo?.src ?? poster(model.asset),
    width: photo?.width ?? 640,
    height: photo?.height ?? 640,
    alt: photo?.[language] ?? `${model[language]} · ${language === 'zh' ? '建筑模型示例' : 'Architectural model study'}`,
    kind: photo ? 'photo' : 'model',
  };
}
function updateCatalogImage(image, project) {
  image.width = project.width;
  image.height = project.height;
  image.alt = project.alt;
  // The browser owns image requests; no asynchronous callback can replace a
  // later selection when the directory is clicked quickly.
  if (image.getAttribute('src') !== project.src) image.src = project.src;
}
function renderCatalogSelection() {
  for (const button of projectIndexGrid.children) {
    if (Number(button.dataset.index) === selectedProjectIndex) button.setAttribute('aria-current', 'true');
    else button.removeAttribute('aria-current');
  }
  // Reveal the selected row without moving the page away from its photograph.
  if (projectIndexScroll.scrollHeight > projectIndexScroll.clientHeight) {
    const entry = projectIndexGrid.children[selectedProjectIndex].getBoundingClientRect();
    const list = projectIndexScroll.getBoundingClientRect();
    if (entry.top < list.top) projectIndexScroll.scrollTop += entry.top - list.top;
    else if (entry.bottom > list.bottom) projectIndexScroll.scrollTop += entry.bottom - list.bottom;
  }
  const project = catalogProject(selectedProjectIndex);
  projectFeature.dataset.kind = project.kind;
  projectFeature.dataset.index = selectedProjectIndex;
  projectFeature.dataset.model = models[selectedProjectIndex].asset;
  projectFeatureOpen.dataset.index = selectedProjectIndex;
  projectFeatureDetails.dataset.index = selectedProjectIndex;
  const action = language === 'zh' ? '打开项目预览' : 'Open project preview';
  projectFeatureOpen.setAttribute('aria-label', `${project.title} · ${action}`);
  projectFeatureDetails.setAttribute('aria-label', `${project.title} · ${action}`);
  projectFeatureDetails.textContent = language === 'zh' ? '项目详情 ↗' : 'Project details ↗';
  updateCatalogImage(projectFeatureImage, project);
  document.querySelector('#project-feature-number').textContent = pad(selectedProjectIndex+1);
  document.querySelector('#project-feature-title').textContent = project.title;
  document.querySelector('#project-feature-meta').textContent = project.meta;
}
function renderProjectCatalog() {
  projectIndexGrid.setAttribute('aria-label', language === 'zh' ? '项目目录' : 'Project contents');
  projectImageSequence.setAttribute('aria-label', language === 'zh' ? '项目图集' : 'Project images');
  for (const [index, button] of [...projectIndexGrid.children].entries()) {
    const project = catalogProject(index);
    button.querySelector('.project-index-title').textContent = project.title;
    const label = button.querySelector('.project-index-type');
    label.textContent = project.sampleLabel;
    label.hidden = !project.sampleLabel;
    button.setAttribute('aria-label', `${pad(index+1)} · ${project.title} · ${project.meta}`);
    const plate = projectImageSequence.children[index];
    plate.dataset.kind = project.kind;
    plate.querySelector('.project-plate-title').textContent = project.title;
    plate.querySelector('.project-plate-meta').textContent = project.meta;
    plate.querySelector('.project-plate-open').setAttribute('aria-label', `${project.title} · ${language === 'zh' ? '打开项目预览' : 'Open project preview'}`);
    updateCatalogImage(plate.querySelector('img'), project);
  }
  renderCatalogSelection();
}
function setProjectLayout(layout) {
  projectLayout = layout === 'scroll' ? 'scroll' : 'select';
  pageSections.projects.dataset.layout = projectLayout;
  projectFeature.hidden = projectLayout !== 'select';
  projectImageSequence.hidden = projectLayout !== 'scroll';
  for (const [index, button] of [...projectIndexGrid.children].entries()) {
    button.setAttribute('aria-controls', projectLayout === 'select' ? 'project-feature' : `project-plate-${pad(index+1)}`);
    if (projectLayout === 'scroll') button.setAttribute('aria-haspopup', 'dialog');
    else button.removeAttribute('aria-haspopup');
  }
}
function selectCatalogProject(index) {
  selectedProjectIndex = Math.max(0, Math.min(models.length - 1, index));
  renderCatalogSelection();
}
let catalogSlideFrame = 0;
function cancelCatalogSlide() {
  cancelAnimationFrame(catalogSlideFrame);
  catalogSlideFrame = 0;
}
function revealCatalogProject(index, behavior = 'instant') {
  cancelCatalogSlide();
  selectCatalogProject(index);
  if (projectLayout !== 'scroll') return;

  const plate = projectImageSequence.children[selectedProjectIndex];
  if (behavior === 'instant' || reduceMotion.matches) {
    plate.scrollIntoView({block: 'start', behavior: 'instant'});
    return;
  }
  const startY = window.scrollY;
  const marginTop = parseFloat(getComputedStyle(plate).scrollMarginTop) || 0;
  const maxY = document.scrollingElement.scrollHeight - innerHeight;
  const targetY = Math.max(0, Math.min(maxY, startY + plate.getBoundingClientRect().top - marginTop));
  const distance = targetY - startY;
  if (Math.abs(distance) < 1) return;

  const duration = Math.min(800, 400 + Math.abs(distance) * 0.094);
  const start = performance.now();
  function slide(now) {
    const progress = Math.min(1, (now - start) / duration);
    const eased = progress * progress * (3 - 2 * progress);
    window.scrollTo({top: startY + distance * eased, behavior: 'instant'});
    catalogSlideFrame = progress < 1 ? requestAnimationFrame(slide) : 0;
  }
  catalogSlideFrame = requestAnimationFrame(slide);
}
function interruptCatalogSlide() {
  if (!catalogSlideFrame) return;
  cancelCatalogSlide();
  syncCatalogScroll();
}
for (const event of ['wheel', 'touchstart', 'pointerdown', 'keydown']) {
  window.addEventListener(event, interruptCatalogSlide, {capture: true, passive: true});
}
let catalogPointerX, catalogPointerY;
projectIndexGrid.addEventListener('pointermove', event => {
  if (projectLayout !== 'scroll' || !catalogHover.matches || event.pointerType !== 'mouse' || projectDialog.open) return;
  // Repositioning the page can move another row under a stationary pointer.
  // Only physical movement should navigate the catalogue.
  if (event.clientX === catalogPointerX && event.clientY === catalogPointerY) return;
  catalogPointerX = event.clientX;
  catalogPointerY = event.clientY;
  const entry = event.target.closest('.project-index-card');
  if (!entry) return;
  const index = Number(entry.dataset.index);
  if (index !== selectedProjectIndex) revealCatalogProject(index, 'smooth');
}, {passive: true});
projectIndexGrid.addEventListener('keydown', event => {
  const button = event.target.closest('.project-index-card');
  if (!button) return;
  const index = Number(button.dataset.index);
  const next = {ArrowUp:index-1, ArrowDown:index+1, Home:0, End:models.length-1}[event.key];
  if (next === undefined) return;
  event.preventDefault();
  revealCatalogProject(next);
  projectIndexGrid.children[selectedProjectIndex].focus({preventScroll:true});
});
projectFeatureOpen.setAttribute('aria-haspopup', 'dialog');
projectFeatureDetails.setAttribute('aria-haspopup', 'dialog');
projectFeatureDetails.classList.add('project-feature-details');
projectFeatureOpen.addEventListener('click', () => openProject(selectedProjectIndex, projectFeatureOpen));
projectFeatureDetails.addEventListener('click', () => openProject(selectedProjectIndex, projectFeatureDetails));
let catalogScrollScheduled = false;
function syncCatalogScroll() {
  catalogScrollScheduled = false;
  if (catalogSlideFrame || projectLayout !== 'scroll' || pageSections.projects.hidden || projectDialog.open) return;
  const header = projectNavBar.hidden ? siteHeader : projectNavBar;
  const barBottom = Math.max(0, header.getBoundingClientRect().bottom);
  let mostVisible = 0, next = selectedProjectIndex;
  for (const [index, plate] of [...projectImageSequence.children].entries()) {
    const rect = plate.getBoundingClientRect();
    const visible = Math.max(0, Math.min(innerHeight, rect.bottom) - Math.max(barBottom, rect.top));
    if (visible > mostVisible) { mostVisible = visible; next = index; }
  }
  if (mostVisible > 0 && next !== selectedProjectIndex) selectCatalogProject(next);
}
window.addEventListener('scroll', () => {
  if (catalogSlideFrame || catalogScrollScheduled || projectLayout !== 'scroll') return;
  catalogScrollScheduled = true;
  requestAnimationFrame(syncCatalogScroll);
}, {passive:true});
window.addEventListener('resize', syncCatalogScroll);
setProjectLayout(projectLayout);

let previousCatalogStart;
function fitCatalogOpening() {
  if (pageSections.projects.hidden) return;
  const catalogStart = window.scrollY + pageSections.projects.getBoundingClientRect().top;
  const wasAtStart = previousCatalogStart !== undefined && Math.abs(window.scrollY - previousCatalogStart) < 1;
  // A resize or language change can reflow the home gallery above the projects anchor.
  if (currentPage === 'projects' && wasAtStart && !projectDialog.open && Math.abs(window.scrollY - catalogStart) >= 1) {
    window.scrollTo({top:catalogStart, behavior:'instant'});
  }
  previousCatalogStart = catalogStart;
  const sectionTop = catalogStart - window.scrollY;
  const viewport = document.documentElement.clientHeight;
  const catalogTop = projectCatalog.getBoundingClientRect().top - sectionTop;
  const headingSpace = projectIndexScroll.getBoundingClientRect().top - projectDirectory.getBoundingClientRect().top;
  const compactLimit = parseFloat(getComputedStyle(projectIndexScroll).getPropertyValue('--compact-list-height'));
  const room = Math.min(viewport - catalogTop - headingSpace - 24, compactLimit || Infinity);
  const rowHeight = projectIndexGrid.firstElementChild.getBoundingClientRect().height;
  if (rowHeight > 0) {
    const rows = Math.max(1, Math.floor(room / rowHeight));
    projectIndexScroll.style.maxHeight = `${rows * rowHeight}px`;
  }

  const figure = projectLayout === 'scroll' ? projectImageSequence.firstElementChild : projectFeature;
  const caption = figure.querySelector('figcaption');
  const captionGap = parseFloat(getComputedStyle(caption).marginTop);
  // Show the caption below the fold when the group does not fit beneath the photo.
  const photoBottom = figure.firstElementChild.getBoundingClientRect().bottom - sectionTop;
  const captionTop = photoBottom + captionGap;
  const spaceBelow = viewport - captionTop;
  figure.style.rowGap = spaceBelow > 0 && spaceBelow < caption.getBoundingClientRect().height + 1
    ? `${Math.ceil(spaceBelow) + 1}px` : '0px';
}

const catalogSizeObserver = new ResizeObserver(() => requestAnimationFrame(fitCatalogOpening));
for (const element of [homeGallery, projectHeader, projectDirectory.firstElementChild, projectIndexGrid,
  ...projectImageSequence.firstElementChild.children, ...projectFeature.children]) catalogSizeObserver.observe(element);
window.addEventListener('resize', fitCatalogOpening);
function updateControls(){
  const ready=detailState==='ready',state=viewer?.status();
  motionToggle.disabled=!ready||reduceMotion.matches;
  motionToggle.textContent=reduceMotion.matches?labels[language].static:words[language][state?.rotating?'pause':'play'];
  motionToggle.setAttribute('aria-pressed',String(!!state?.rotating));
  lightToggle.disabled=!ready;
  lightToggle.textContent=labels[language][state?.light===false?'off':'on'];
  lightToggle.setAttribute('aria-pressed',String(state?.light!==false));
  document.querySelectorAll('#turn-left,#turn-right').forEach(button=>button.disabled=!ready);
  document.querySelector('#detail-status').textContent=detailState==='loading'?labels[language].loading:detailState==='error'?labels[language].error:'';
}
function renderProjectFacts(list, facts) {
  list.replaceChildren(...facts.map(([label, value]) => {
    const row = document.createElement('div');
    const term = document.createElement('dt');
    const definition = document.createElement('dd');
    term.textContent = label;
    definition.textContent = value;
    row.append(term, definition);
    return row;
  }));
}
function renderPhotoPreview(photos) {
  const photo = photos[photoIndex];
  photoPreviewImage.width = photo.width;
  photoPreviewImage.height = photo.height;
  photoPreviewImage.alt = photo[language];
  if (photoPreviewImage.getAttribute('src') !== photo.src) photoPreviewImage.src = photo.src;
  photoPreviewCount.textContent = `${photoIndex + 1} / ${photos.length}`;
  photoPreviewLeft.hidden = photoPreviewRight.hidden = photos.length < 2;
}
function buildPhotoThumbnails(photos) {
  detailPhotoThumbnails.replaceChildren(...photos.map((photo, index) => {
    const button = document.createElement('button');
    const image = new Image();
    button.type = 'button';
    button.dataset.index = index;
    image.alt = '';
    image.draggable = false;
    image.loading = 'lazy';
    image.decoding = 'async';
    image.src = photo.thumbnail;
    button.append(image);
    button.addEventListener('click', () => showDetailPhoto(index));
    return button;
  }));
  detailPhotoThumbnails.scrollLeft = 0;
}
function renderDetailPhoto(photos) {
  const photo = photos[photoIndex];
  detailPhotoImage.width = photo.width;
  detailPhotoImage.height = photo.height;
  detailPhotoImage.alt = photo[language];
  if (detailPhotoImage.getAttribute('src') !== photo.src) detailPhotoImage.src = photo.src;
  detailPhotoStatus.textContent = `${pad(photoIndex + 1)} / ${pad(photos.length)} · ${photo[language]}`;
  if (photoPreview.open) renderPhotoPreview(photos);
  if (detailPhotoThumbnails.hidden) return;
  detailPhotoThumbnails.querySelector('[aria-current="true"]')?.removeAttribute('aria-current');
  const selected = detailPhotoThumbnails.children[photoIndex];
  selected.setAttribute('aria-current', 'true');
  const strip = detailPhotoThumbnails.getBoundingClientRect();
  const thumb = selected.getBoundingClientRect();
  const inset = 4;
  if (thumb.left < strip.left + inset) {
    detailPhotoThumbnails.scrollLeft -= strip.left + inset - thumb.left;
  } else if (thumb.right > strip.right - inset) {
    detailPhotoThumbnails.scrollLeft += thumb.right - strip.right + inset;
  }
}
function showDetailPhoto(index) {
  const photos = projectContent[projectAssetForIndex(detailIndex)]?.photos ?? [];
  if (photos.length < 2) return;
  photoIndex = (index + photos.length) % photos.length;
  renderDetailPhoto(photos);
}
function updateDetailText(){
  const model = models[detailIndex];
  projectDialog.dataset.model = model.asset;
  const copy = words[language];
  const asset = projectAssetForIndex(detailIndex);
  const project = projectContent[asset];
  const details = project?.[language];
  const title = details?.title ?? model[language];
  const indexLabel = `${copy.study.toUpperCase()} ${pad(detailIndex+1)}`;
  const detailLabel = document.querySelector('#detail-index');
  const isSample = asset !== model.asset;
  detailLabel.hidden = !!details && !isSample;
  detailLabel.textContent = isSample ? copy.homeSample : details ? '' : indexLabel;
  document.querySelector('#project-title').textContent = title;
  document.querySelector('#project-subtitle').textContent = details?.subtitle ?? copy.subtitle;
  detailPoster.alt = details ? title : `${indexLabel} — ${title}`;
  projectDescription.replaceChildren(...(details?.introduction ?? [copy.description]).map(text => {
    const paragraph = document.createElement('p');
    paragraph.textContent = text;
    return paragraph;
  }));
  renderProjectFacts(projectFacts, details?.facts ?? [[copy.typeLabel, copy.typeValue], [copy.contentLabel, copy.contentValue]]);
  projectFullLink.hidden = !project?.detailHref;
  if (project?.detailHref) projectFullLink.setAttribute('href', project.detailHref);
  else projectFullLink.removeAttribute('href');
  projectFullLink.textContent = language === 'zh' ? '项目详情 ↗' : 'Project details ↗';
  sampleDisclaimer.hidden = !!project;
  detailPhotoZoom.setAttribute('aria-label', copy.zoomPhoto);
  photoPreview.setAttribute('aria-label', copy.photoPreview);
  detailPhotoLeft.setAttribute('aria-label', copy.previousPhoto);
  detailPhotoRight.setAttribute('aria-label', copy.nextPhoto);
  photoPreviewLeft.setAttribute('aria-label', copy.previousPhoto);
  photoPreviewRight.setAttribute('aria-label', copy.nextPhoto);
  detailPhotoThumbnails.setAttribute('aria-label', copy.photoThumbnails);
  Array.from(detailPhotoThumbnails.children).forEach((button, index) => {
    button.setAttribute('aria-label', `${pad(index + 1)} · ${project.photos[index][language]}`);
  });
  detailPhotoCredit.textContent = details?.photoCredit ?? '';
  if (projectDialog.open && project?.photos.length) renderDetailPhoto(project.photos);
  updateControls();
}
function loadDetail(index) {
  stopModel(true);
  detailIndex = (index + models.length) % models.length;
  const asset = projectAssetForIndex(detailIndex);
  const photos = projectContent[asset]?.photos ?? [];
  const hasPhotos = photos.length > 0;
  photoIndex = catalogPhotoIndex(detailIndex, asset);
  detailPhotoStatus.textContent = '';
  detailModel.hidden = hasPhotos;
  detailPhoto.hidden = !hasPhotos;
  detailPhotoArrows.hidden = photos.length < 2;
  detailPhotoThumbnails.hidden = photos.length < 2;
  buildPhotoThumbnails(photos.length > 1 ? photos : []);
  projectDialog.classList.toggle('has-project-photos', hasPhotos);
  detailState = 'idle';
  updateDetailText();
  projectDialog.scrollTo({top:0, behavior:'instant'});
  if (hasPhotos) return;
  detailPoster.src = poster(asset);
  showModel(detailStage.querySelector('.model-object'), asset, state => {
    detailState = state;
    updateControls();
  });
}
function openProject(index, trigger){
  if(currentPage!=='home'&&currentPage!=='projects')return;
  cancelCatalogSlide();
  deactivate(true);
  if(!projectDialog.open){
    projectOpener = trigger;
    projectClosedByPointer = false;
    projectDialog.showModal();
  }
  document.body.classList.add('has-dialog');loadDetail(index);
}
function closeProject(event) {
  projectClosedByPointer = event.detail > 0;
  projectDialog.close();
}
projectFullLink.addEventListener('click', () => {
  const asset = projectAssetForIndex(detailIndex);
  const openerKind = ['project-feature-open', 'project-feature-details', 'project-plate-open', 'project-index-card'].find(kind => projectOpener?.classList.contains(kind)) ?? 'model-card';
  const openerIndex = Number(projectOpener?.dataset.index);
  const saved = {
    version: 3, asset, language, page: currentPage, photoIndex, projectLayout, selectedProjectIndex, detailIndex,
    scrollY, dialogScrollTop: projectDialog.scrollTop,
    thumbnailScrollLeft: detailPhotoThumbnails.scrollLeft,
    openerKind, openerIndex: Number.isInteger(openerIndex) ? openerIndex : detailIndex,
  };
  try { sessionStorage.setItem(projectReturnKey(asset), JSON.stringify(saved)); } catch { /* The explicit return route still opens this project. */ }
});
projectDialog.addEventListener('close',()=>{
  if(projectDialog.open)return;
  deactivate(true);stopModel(true);detailState='idle';document.body.classList.remove('has-dialog');
  const opener = projectOpener;
  projectOpener = null;
  if (!opener) return;
  if (!opener.matches('.model-card')) {
    opener.focus({preventScroll:true});
    return;
  }
  if (projectClosedByPointer) {
    const focused = document.activeElement;
    if (projectDialog.contains(focused) || focused.matches('.model-card:focus-visible')) {
      mainContent.focus({preventScroll:true});
    }
    return;
  }
  opener.focus({preventScroll:true});
  if (opener.matches(':focus-visible')) activate(opener);
});
document.querySelector('#previous-project').addEventListener('click',()=>loadDetail(detailIndex-1));
document.querySelector('#next-project').addEventListener('click',()=>loadDetail(detailIndex+1));
detailPhotoZoom.addEventListener('click', () => {
  renderPhotoPreview(projectContent[projectAssetForIndex(detailIndex)].photos);
  photoPreview.showModal();
});
photoPreview.addEventListener('close', () => {
  if (projectDialog.open) detailPhotoZoom.focus({preventScroll:true});
});
for (const button of [detailPhotoLeft, photoPreviewLeft]) {
  button.addEventListener('click', () => showDetailPhoto(photoIndex - 1));
}
for (const button of [detailPhotoRight, photoPreviewRight]) {
  button.addEventListener('click', () => showDetailPhoto(photoIndex + 1));
}
function handlePhotoArrowKey(event) {
  if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
  event.preventDefault();
  showDetailPhoto(photoIndex + (event.key === 'ArrowLeft' ? -1 : 1));
}
detailPhoto.addEventListener('keydown', handlePhotoArrowKey);
photoPreview.addEventListener('keydown', handlePhotoArrowKey);
let thumbnailDrag = null;
detailPhotoThumbnails.addEventListener('pointerdown', event => {
  if (event.pointerType !== 'mouse' || event.button !== 0) return;
  thumbnailDrag = {id:event.pointerId, x:event.clientX, scrollLeft:detailPhotoThumbnails.scrollLeft};
});
detailPhotoThumbnails.addEventListener('pointermove', event => {
  if (thumbnailDrag?.id !== event.pointerId) return;
  const offset = event.clientX - thumbnailDrag.x;
  if (!detailPhotoThumbnails.hasPointerCapture(event.pointerId)) {
    if (Math.abs(offset) < 6) return;
    // Capture on the strip after a drag starts so release does not click a thumbnail.
    detailPhotoThumbnails.setPointerCapture(event.pointerId);
    detailPhotoThumbnails.classList.add('is-dragging');
  }
  detailPhotoThumbnails.scrollLeft = thumbnailDrag.scrollLeft - offset;
});
for (const type of ['pointerup', 'pointercancel', 'lostpointercapture', 'pointerleave']) {
  detailPhotoThumbnails.addEventListener(type, event => {
    if (thumbnailDrag?.id !== event.pointerId) return;
    if (type === 'pointerleave' && detailPhotoThumbnails.hasPointerCapture(event.pointerId)) return;
    thumbnailDrag = null;
    detailPhotoThumbnails.classList.remove('is-dragging');
  });
}
function turn(delta){viewer?.turn(delta);updateControls();}
document.querySelector('#turn-left').addEventListener('click',()=>turn(Math.PI/12));
document.querySelector('#turn-right').addEventListener('click',()=>turn(-Math.PI/12));
motionToggle.addEventListener('click',()=>{viewer?.toggleRotation();updateControls();});
lightToggle.addEventListener('click',()=>{viewer?.toggleLight();updateControls();});
detailStage.addEventListener('keydown',event=>{
  if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();turn(event.key==='ArrowLeft'?Math.PI/12:-Math.PI/12);}
});
let drag=null;
detailStage.addEventListener('pointerdown',event=>{
  if(event.button!==0||detailState!=='ready')return;
  drag={id:event.pointerId,x:event.clientX,y:event.clientY,lastX:event.clientX,active:false};
});
detailStage.addEventListener('pointermove',event=>{
  if(!drag||event.pointerId!==drag.id)return;
  const dx=event.clientX-drag.x,dy=event.clientY-drag.y;
  if(!drag.active){
    if(Math.abs(dy)>8&&Math.abs(dy)>Math.abs(dx)){drag=null;return;}
    if(Math.abs(dx)<6)return;
    drag.active=true;detailStage.setPointerCapture(event.pointerId);detailStage.classList.add('is-dragging');
  }
  turn((event.clientX-drag.lastX)*.008);drag.lastX=event.clientX;
});
function endDrag(event){if(detailStage.hasPointerCapture(event.pointerId))detailStage.releasePointerCapture(event.pointerId);drag=null;detailStage.classList.remove('is-dragging');}
detailStage.addEventListener('pointerup',endDrag);detailStage.addEventListener('pointercancel',endDrag);
function updateAbout(){
  const content=aboutContent[language];
  for(const [id,key] of [['about-heading','heading'],['about-founder-name','founderName'],['about-founder-role','founderRole']])document.getElementById(id).textContent=content[key];
  const prose = [
    ['about-practice-copy', content.practice.slice(0, 2)],
    ['about-practice-notes', content.practice.slice(2)],
    ['about-biography', content.biography],
    ['about-contact-intro', content.contactIntro],
    ['contact-page-intro', content.contactIntro],
  ];
  for (const [id, paragraphs] of prose) {
    document.getElementById(id).replaceChildren(...paragraphs.map(text => {
      const paragraph = document.createElement('p');
      paragraph.textContent = text;
      return paragraph;
    }));
  }
  document.querySelectorAll('[data-about-label]').forEach(el=>el.textContent=content[el.dataset.aboutLabel]);
  document.querySelector('#about-contact').setAttribute('aria-label',words[language].contact);
  document.querySelector('#about-craft').alt=content.craftAlt;
  document.querySelector('#about-portrait').alt=content.portraitAlt;
}
function updatePageTitle(){
  if(currentPage==='home'){
    document.title=language==='zh'?'石页建筑 — 建筑模型展厅':'shiye architects — model studies';return;
  }
  const titles=language==='zh'?{projects:'项目',about:'关于',journal:'日志',news:'新闻',contact:'联系'}:{projects:'Projects',about:'About',journal:'Journal',news:'News',contact:'Contact'};
  document.title=`${titles[currentPage]} — ${language==='zh'?'石页建筑':'shiye architects'}`;
}
function showPage(){
  cancelCatalogSlide();
  const route=location.hash.slice(1);
  const returnAsset=route.startsWith('project-preview=')?route.slice('project-preview='.length):null;
  const returnIndex=models.findIndex(model=>model.asset===returnAsset && projectContent[model.asset]);
  const saved=returnIndex>=0?readProjectReturn(returnAsset):null;
  currentPage=returnIndex>=0?(saved?.page==='projects'?'projects':'home'):route==='about-contact'?'about':Object.hasOwn(pageSections,route)?route:'home';
  deactivate(true);stopModel(true);
  if(photoPreview.open)photoPreview.close();
  if(projectDialog.open){
    projectOpener = null;
    projectDialog.close();
  }
  document.body.classList.remove('has-dialog');
  document.body.dataset.page=currentPage;
  const showGallery = currentPage === 'home' || currentPage === 'projects';
  document.body.classList.toggle('is-inner', !showGallery);
  document.body.classList.toggle('is-about',currentPage==='about');
  homeGallery.hidden = !showGallery;
  projectNavBar.hidden = !showGallery;
  for (const [name, section] of Object.entries(pageSections)) {
    section.hidden = name !== currentPage && !(showGallery && name === 'projects');
  }
  for(const link of document.querySelectorAll('.navigation a[href]')){
    const inProjectBar = projectNavigation.contains(link);
    const active = showGallery
      ? inProjectBar && link.getAttribute('href') === '#projects'
      : link.getAttribute('href') === `#${currentPage}`;
    link.classList.toggle('is-current', active);
    if (active) link.setAttribute('aria-current', inProjectBar ? 'location' : 'page');
    else link.removeAttribute('aria-current');
  }
  if(currentPage==='about')for(const name of ['craft','portrait']){
    const image=document.getElementById(`about-${name}`),asset=aboutImages[name];
    if(!image.hasAttribute('src')){image.width=asset.width;image.height=asset.height;image.src=asset.src;}
  }
  updatePageTitle();
  measureSiteHeader();
  if (showGallery) fitCatalogOpening();
  if (returnIndex < 0) {
    if (route === 'projects') pageSections.projects.scrollIntoView({block:'start', behavior:'instant'});
    else if (route === 'about-contact') document.getElementById('about-contact').scrollIntoView();
    else window.scrollTo({top:0, behavior:'instant'});
  }
  if(returnIndex>=0){
    // The reader closes one level back to the existing preview. Remove the
    // return marker so later reloads and the preview's own X behave normally.
    const returnUrl = new URL(location.href);
    const fromOldSingleImage = saved?.version === 1 && saved.projectLayout === 'select';
    if (saved?.projectLayout === 'select' || saved?.projectLayout === 'scroll') {
      setProjectLayout(fromOldSingleImage ? 'scroll' : saved.projectLayout);
      returnUrl.searchParams.set('project-layout', projectLayout);
    }
    returnUrl.hash = currentPage;
    history.replaceState(null,'',returnUrl);
    setLanguage(saved?.language==='en'?'en':'zh');
    const openerKinds = ['project-index-card', 'project-feature-open', 'project-feature-details', 'project-plate-open'];
    let kind = openerKinds.includes(saved?.openerKind) ? saved.openerKind : 'model-card';
    if (fromOldSingleImage && kind.startsWith('project-feature-')) kind = 'project-plate-open';
    const openerIndex=Number.isInteger(saved?.openerIndex)&&saved.openerIndex>=0&&saved.openerIndex<models.length?saved.openerIndex:returnIndex;
    const catalogIndex = Number.isInteger(saved?.selectedProjectIndex) && saved.selectedProjectIndex >= 0 && saved.selectedProjectIndex < models.length ? saved.selectedProjectIndex : openerIndex;
    const revealMigratedPlate = fromOldSingleImage && currentPage === 'projects' && kind === 'project-plate-open';
    if (revealMigratedPlate) revealCatalogProject(catalogIndex);
    else {
      selectCatalogProject(catalogIndex);
      // Older project-page positions were recorded without the gallery above them.
      const galleryOffset = saved?.page === 'projects' && saved.version < 3
        ? window.scrollY + pageSections.projects.getBoundingClientRect().top
        : 0;
      window.scrollTo({top:galleryOffset + nonnegative(saved?.scrollY),behavior:'instant'});
    }
    const sourceCard=document.querySelector(`.${kind}[data-index="${openerIndex}"]`);
    if (sourceCard && !sourceCard.matches('.model-card')) sourceCard.focus({preventScroll:true});
    const savedDetailIndex = saved?.detailIndex;
    const restoredDetailIndex = Number.isInteger(savedDetailIndex) && models[savedDetailIndex]
      && projectAssetForIndex(savedDetailIndex) === returnAsset ? savedDetailIndex : returnIndex;
    openProject(restoredDetailIndex, sourceCard);
    const photos=projectContent[returnAsset].photos;
    showDetailPhoto(Math.min(Math.floor(nonnegative(saved?.photoIndex)),photos.length-1));
    detailPhotoThumbnails.scrollLeft=nonnegative(saved?.thumbnailScrollLeft);
    projectDialog.scrollTop=nonnegative(saved?.dialogScrollTop);
  }
}
window.addEventListener('hashchange',showPage);
document.querySelectorAll('.navigation a,.wordmark,.detail-home-link').forEach(link=>link.addEventListener('click',event=>{
  const target=link.getAttribute('href');
  if (currentPage === 'home' && projectNavigation.contains(link) && target === '#projects') {
    event.preventDefault();
    pageSections.projects.scrollIntoView({block:'start'});
    return;
  }
  if(location.hash===target||(target==='#home'&&!location.hash)){event.preventDefault();showPage();}
}));
document.querySelector('.skip-link').addEventListener('click',event=>{
  event.preventDefault();mainContent.focus({preventScroll:true});mainContent.scrollIntoView({block:'start'});
});
document.querySelectorAll('[data-close]').forEach(button=>{
  const dialog = document.getElementById(button.dataset.close);
  button.addEventListener('click', dialog === projectDialog ? closeProject : () => dialog.close());
});
projectDialog.addEventListener('click', event => {
  if (event.target !== projectDialog) return;
  const bounds = projectDialog.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right ||
      event.clientY < bounds.top || event.clientY > bounds.bottom) closeProject(event);
});
function setLanguage(next){
  language=next;document.documentElement.lang=next==='zh'?'zh-CN':'en';
  updatePageTitle();
  mainNavigation.setAttribute('aria-label', next==='zh' ? '主导航' : 'Main navigation');
  projectNavigation.setAttribute('aria-label', next==='zh' ? '项目区导航' : 'Project section navigation');
  document.querySelectorAll('[data-i18n]').forEach(el=>el.textContent=words[language][el.dataset.i18n]);
  document.querySelectorAll('.model-card').forEach((card,index)=>{
    const model = models[index];
    const project = projectContent[model.asset]?.[language];
    const displayProject = project ?? projectContent[temporaryHomeProjectAsset][language];
    const title = displayProject?.shortTitle ?? displayProject?.title ?? model[language];
    const sample = words[language].homeSample;
    card.querySelector('.caption-title').textContent = title;
    card.querySelector('.caption-type').textContent = project?.subtitle ?? sample;
    card.setAttribute('aria-label', project?.title ?? `${title} · ${sample} ${pad(index+1)}`);
    if(card.dataset.modelState==='error')card.querySelector('.model-status').textContent=labels[language].error;
  });
  renderProjectCatalog();
  for (const toggle of languageToggles) {
    toggle.textContent = next==='en' ? '中' : 'EN';
    toggle.setAttribute('aria-label', next==='en' ? '切换为中文' : 'Switch to English');
  }
  document.querySelector('.skip-link').textContent=labels[language].skip;
  document.querySelectorAll('.close-button').forEach(el=>el.setAttribute('aria-label',language==='en'?'Close':'关闭'));
  detailStage.setAttribute('aria-label',language==='zh'?'建筑模型，左右拖动或按方向键转动':'Building model; drag horizontally or use arrow keys to turn');
  document.querySelector('#turn-left').setAttribute('aria-label',language==='zh'?'向左转动模型':'Turn model left');
  document.querySelector('#turn-right').setAttribute('aria-label',language==='zh'?'向右转动模型':'Turn model right');
  updateDetailText();updateAbout();
}
for (const toggle of languageToggles) {
  toggle.addEventListener('click',()=>setLanguage(language==='en'?'zh':'en'));
}
document.addEventListener('visibilitychange',()=>{if(document.hidden)deactivate(true);});
reduceMotion.addEventListener('change',()=>updateControls());
setLanguage('zh');
showPage();
// Read-only diagnostics for local verification. No alternate geometry or light path.
window.__homeStudy={models,diagnostics:()=>viewer?.status()??{contextCount:0,active:false},audit:()=>viewer?.audit()};
