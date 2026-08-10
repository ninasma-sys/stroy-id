const $ = (s, el=document) => el.querySelector(s);
const app = $('#app'); const modalRoot = $('#modal-root');
const roles = ['Руководитель проекта','Производитель работ','Сотрудник ПТО','Геодезист','Входной контроль','Лаборатория'];
const structures=['Шлюз № 15','Шлюз № 16','Подходной канал','Насосная станция','Административно-бытовой корпус'];
const worksSeed=[
 ['ИД-001','08.07.2026','Шлюз № 15','Секция № 1','Фундаментная плита','Устройство песчаной подготовки','850','м³','Петров П.П.',100,0,'Подписан','done'],
 ['ИД-002','09.07.2026','Шлюз № 15','Секция № 1','Фундаментная плита','Устройство щебёночной подготовки','620','м³','Петров П.П.',87,1,'На проверке','review'],
 ['ИД-003','10.07.2026','Шлюз № 15','Секция № 2','Фундаментная плита','Монтаж опалубки','1 240','м²','Петров П.П.',72,2,'Ожидает документов','waiting'],
 ['ИД-004','11.07.2026','Шлюз № 15','Секция № 2','Фундаментная плита','Армирование фундаментной плиты','96','т','Петров П.П.',61,3,'Черновик','overdue'],
 ['ИД-005','03.07.2026','Шлюз № 16','Секция № 1','Фундаментная плита','Бетонирование фундаментной плиты','480','м³','Петров П.П.',100,0,'Подписан','done'],
 ['ИД-006','07.07.2026','Шлюз № 15','Секция № 3','Стена шлюза','Армирование стены шлюза','42','т','Петров П.П.',45,4,'Ожидает документов','overdue'],
 ['ИД-007','08.07.2026','Шлюз № 15','Секция № 3','Стена шлюза','Бетонирование стены шлюза','230','м³','Петров П.П.',35,5,'Ожидает документов','overdue'],
 ['ИД-008','10.07.2026','Подходной канал','ПК 12+40','Шпунтовое ограждение','Погружение шпунта','87','шт','Петров П.П.',78,1,'Сформирован','progress'],
 ['ИД-009','11.07.2026','Насосная станция','Оси 1–5','Наружные стены','Устройство гидроизоляции','520','м²','Петров П.П.',55,2,'Черновик','progress'],
 ['ИД-010','12.07.2026','Шлюз № 16','Секция № 2','Пазухи котлована','Обратная засыпка','1 100','м³','Петров П.П.',90,1,'На проверке','review'],
 ['ИД-011','12.07.2026','Шлюз № 16','Секция № 2','Закладные детали','Монтаж закладных деталей','28','шт','Петров П.П.',68,2,'Черновик','progress'],
 ['ИД-012','13.07.2026','Административно-бытовой корпус','Оси А–Г','Наружные сети','Прокладка наружных инженерных сетей','210','м','Петров П.П.',82,1,'Сформирован','progress']
];
let state = JSON.parse(localStorage.getItem('stroi-control-state')||'null') || {role:'Руководитель проекта', page:'Главная', works:worksSeed.map((w,i)=>({id:i+1,created:'13.07.2026, 09:'+(10+i),...rowObj(w)})), tasks:seedTasks(), notifications:4, uploads:[], audit:[]};
state.uploads ||= [];
state.workFilter ||= {structure:'', status:'', overdue:''};
state.audit ||= [];
state.directoryValues ||= {};
state.profileSettings ||= {};
function rowObj(w){return {code:w[0],date:w[1],structure:w[2],section:w[3],construction:w[4],name:w[5],volume:w[6],unit:w[7],foreman:w[8],ready:w[9],missing:w[10],aosr:w[11],state:w[12]}}
function seedTasks(){return [
 {id:1,title:'Исполнительная съёмка фундаментной плиты',work:4,dept:'Геодезическая служба',assignee:'Смирнов Д.В.',due:'14.07.2026',priority:'Высокий',status:'В работе',ready:45},
 {id:2,title:'Проверить документы качества на арматуру',work:4,dept:'Входной контроль',assignee:'Кузнецов Р.О.',due:'14.07.2026',priority:'Высокий',status:'Новая',ready:20},
 {id:3,title:'Загрузить протоколы сварных соединений',work:4,dept:'Строительная лаборатория',assignee:'Орлов М.С.',due:'15.07.2026',priority:'Средний',status:'Ожидает данных',ready:0},
 {id:4,title:'Проверить комплектность ИД и сформировать АОСР',work:4,dept:'ПТО',assignee:'Сидоров А.А.',due:'16.07.2026',priority:'Высокий',status:'Ожидает данных',ready:0},
 {id:5,title:'Загрузить паспорт бетонной смеси',work:7,dept:'Входной контроль',assignee:'Кузнецов Р.О.',due:'11.07.2026',priority:'Критичный',status:'Просрочена',ready:20},
 {id:6,title:'Исполнительная схема шпунтового ограждения',work:8,dept:'Геодезическая служба',assignee:'Смирнов Д.В.',due:'12.07.2026',priority:'Средний',status:'На проверке',ready:100},
 {id:7,title:'Проверить лабораторный протокол № 411',work:5,dept:'ПТО',assignee:'Сидоров А.А.',due:'13.07.2026',priority:'Средний',status:'Выполнена',ready:100},
 {id:8,title:'Загрузить акт входного контроля',work:6,dept:'Входной контроль',assignee:'Кузнецов Р.О.',due:'10.07.2026',priority:'Высокий',status:'Просрочена',ready:0},
 ]}
function save(){localStorage.setItem('stroi-control-state',JSON.stringify(state))}
function logEvent(text, workId=null){state.audit.unshift({id:Date.now()+Math.random(),date:'13.07.2026, '+new Date().toLocaleTimeString('ru-RU',{hour:'2-digit',minute:'2-digit'}),user:'Иванов И.И.',role:state.role,text,workId});save()}
const nav=['Главная','Выполненные работы','Мои задачи','Все задачи','Сооружения','Исполнительная документация','Документы качества','Геодезические документы','Лабораторные протоколы','АОСР','Отчёты','Справочники','Пользователи','Настройки'];
const icons=['⌂','▦','✓','☷','▱','▤','◈','⌖','⚗','✎','▥','⌘','♙','⚙'];
function statusClass(s){return ({'Выполнена':'done','Подписан':'done','Принят':'done','В работе':'progress','Сформирован':'progress','Черновик':'progress','Новая':'new','Ожидает данных':'waiting','Ожидает документов':'waiting','На проверке':'review','Просрочена':'overdue'})[s]||'progress'}
function allowed(action){const byRole={addWork:['Производитель работ','Руководитель проекта','Администратор'],upload:['Геодезист','Входной контроль','Лаборатория','Сотрудник ПТО','Руководитель проекта','Администратор'],aosr:['Сотрудник ПТО','Руководитель проекта','Администратор']};return (byRole[action]||[]).includes(state.role)}
function accessHint(action){return `<div class="source" style="margin:0 0 13px">Действие доступно ролям: ${action==='addWork'?'производитель работ, руководитель проекта':action==='aosr'?'ПТО, руководитель проекта':'геодезия, входной контроль, лаборатория, ПТО'}. Текущая роль: ${state.role}.</div>`}
function shell(content){return `<div class="shell"><aside class="sidebar"><div class="brand"><span class="brand-mark">▰</span><span>СтройКонтроль ИД</span></div><div class="project-mini">ТЕКУЩИЙ ОБЪЕКТ<strong>Гидротехническое сооружение</strong></div><nav class="nav">${nav.map((n,i)=>`${(i===0||i===10)?'<div class="nav-label">'+(i===0?'Рабочее пространство':'Администрирование')+'</div>':''}<button class="${state.page===n?'active':''}" data-page="${n}"><b class="ico">${icons[i]}</b><span>${n}</span></button>`).join('')}</nav></aside><main class="main"><header class="topbar"><div class="object-name">Строительство гидротехнического сооружения</div><div class="search"><input id="global-search" placeholder="Поиск работ, задач, документов, АОСР" /></div><button class="bell" id="notify">♧<i class="badge">${state.notifications}</i></button><div class="user"><div class="avatar">${state.role.split(' ').map(x=>x[0]).slice(0,2).join('')}</div><div><b>Иванов И.И.</b><small>${state.role}</small></div></div></header><section class="content">${content}</section></main></div>`}
function heading(title,sub,action=''){return `<div class="page-heading"><div><h1>${title}</h1><p>${sub||''}</p></div>${action}</div>`}
function dashboard(){let overdue=state.tasks.filter(t=>t.status==='Просрочена').length; return shell(heading('Главная','Панель руководителя · данные обновлены сегодня, 13 июля 2026 г.',`<div class="role-switch"><select id="role">${roles.map(r=>`<option ${r===state.role?'selected':''}>${r}</option>`).join('')}</select></div>`)+`<div class="kpis"><div class="kpi"><div class="kpi-label">Выполнено работ</div><div class="kpi-value">${state.works.length}</div><div class="trend">↑ 3 за неделю</div></div><div class="kpi"><div class="kpi-label">Комплектов ИД в работе</div><div class="kpi-value">9</div><div class="trend">75% от плана</div></div><div class="kpi"><div class="kpi-label">Готово комплектов ИД</div><div class="kpi-value">3</div><div class="trend">↑ 1 за неделю</div></div><div class="kpi"><div class="kpi-label">Сформировано АОСР</div><div class="kpi-value">5</div><div class="trend">4 ожидают проверки</div></div><div class="kpi"><div class="kpi-label">Подписано АОСР</div><div class="kpi-value">2</div><div class="trend">Без замечаний</div></div><div class="kpi"><div class="kpi-label">Просрочено задач</div><div class="kpi-value" style="color:var(--red)">${overdue}</div><div class="trend warn">Требуют внимания</div></div><div class="kpi"><div class="kpi-label">Нет геодезических схем</div><div class="kpi-value" style="color:var(--orange)">4</div><div class="trend warn">По активным работам</div></div><div class="kpi"><div class="kpi-label">Нет документов качества</div><div class="kpi-value" style="color:var(--orange)">3</div><div class="trend warn">По материалам</div></div></div><div class="grid-2"><div><div class="card"><div class="card-head"><h2>Готовность исполнительной документации по сооружениям</h2><button class="action" data-page="Отчёты">Все отчёты →</button></div><div class="chart">${[['Шлюз № 15',61],['Шлюз № 16',78],['Подходной канал',83],['Насосная станция',55],['АБК',82]].map(x=>`<div class="bar-col"><div class="bar" style="height:${x[1]}%"><em>${x[1]}%</em></div><span>${x[0]}</span></div>`).join('')}</div></div><div class="card"><div class="card-head"><h2>Последние выполненные работы</h2><button class="action" data-page="Выполненные работы">Реестр →</button></div>${worksTable(state.works.slice(-4).reverse(),true)}</div></div><div><div class="card"><h2>Распределение задач</h2><div class="donut-wrap"><div class="donut"></div><div class="legend"><span><i class="dot" style="background:#1f6feb"></i>Новые · 13</span><span><i class="dot" style="background:#47a873"></i>В работе · 10</span><span><i class="dot" style="background:#f2b84b"></i>Ожидают данных · 6</span><span><i class="dot" style="background:#7e8da2"></i>На проверке · 6</span><span><i class="dot" style="background:#e85d04"></i>Выполнены · 6</span><span><i class="dot" style="background:#c7372f"></i>Просрочены · 6</span></div></div></div><div class="card"><h2>Критические ситуации</h2><div class="critical">Секция № 2. Армирование фундаментной плиты выполнено, но исполнительная геодезическая схема не загружена.</div><div class="critical">По работе «Бетонирование стены шлюза» отсутствует паспорт на бетонную смесь.</div><div class="critical orange">АОСР № 145 находится на проверке более двух рабочих дней.</div><div class="critical orange">Производитель работ внёс запись через три дня после фактического окончания работ.</div></div></div></div>`)}
function worksTable(works,short=false){return `<div class="table-wrap"><table class="table"><thead><tr><th>№</th><th>Работа / сооружение</th>${short?'': '<th>Дата выполнения</th><th>Объём</th><th>Производитель</th>'}<th>Готовность ИД</th><th>АОСР</th><th>Просрочка</th><th></th></tr></thead><tbody>${works.map(w=>`<tr><td><b>${w.code}</b></td><td><b>${w.name}</b><br><span style="color:var(--muted)">${w.structure} · ${w.section}</span></td>${short?'':`<td>${w.date}<br><span style="color:var(--muted)">${w.created}</span></td><td>${w.volume} ${w.unit}</td><td>${w.foreman}</td>`}<td><span class="progress-line"><i style="width:${w.ready}%"></i></span> ${w.ready}%</td><td><span class="status ${statusClass(w.aosr)}">${w.aosr}</span></td><td>${w.state==='overdue'?'<span class="status overdue">'+w.missing+' дн.</span>':'—'}</td><td><button class="action" data-work="${w.id}">Открыть</button></td></tr>`).join('')}</tbody></table></div>`}
function filters(){return `<div class="filters"><select id="filter-structure"><option value="">Все сооружения</option>${structures.map(x=>`<option value="${x}" ${state.workFilter.structure===x?'selected':''}>${x}</option>`)}</select><select><option>Все участки</option><option>Секция № 1</option><option>Секция № 2</option></select><select><option>Все виды работ</option><option>Бетонирование</option><option>Армирование</option></select><select id="filter-status"><option value="">Все статусы</option><option value="done" ${state.workFilter.status==='done'?'selected':''}>Завершённые / подписанные</option><option value="progress" ${state.workFilter.status==='progress'?'selected':''}>В работе</option><option value="waiting" ${state.workFilter.status==='waiting'?'selected':''}>Ожидают документов</option></select><select id="filter-overdue"><option value="">Любая просрочка</option><option value="yes" ${state.workFilter.overdue==='yes'?'selected':''}>Есть просрочка</option><option value="no" ${state.workFilter.overdue==='no'?'selected':''}>Без просрочки</option></select><input type="date" value="2026-07-01"/><input type="date" value="2026-07-13"/><button class="btn" id="clear-filters">Сбросить</button></div>`}
function worksPage(){let list=state.works.filter(w=>(!state.workFilter.structure||w.structure===state.workFilter.structure)&&(!state.workFilter.status||statusClass(w.aosr)===state.workFilter.status)&&(!state.workFilter.overdue||(state.workFilter.overdue==='yes'?w.state==='overdue':w.state!=='overdue')));let action=allowed('addWork')?`<button class="btn btn-primary" id="add-work">＋ Добавить выполненную работу</button>`:'';return shell(heading('Выполненные работы','Реестр фактически выполненных строительных работ',action)+(!allowed('addWork')?accessHint('addWork'):'')+filters()+`<div class="card"><div class="card-head"><h2>Найдено записей: ${list.length}</h2><span class="source">Даты внесения фиксируются автоматически</span></div>${worksTable(list)}</div>`)}
function taskCard(t){let w=state.works.find(x=>x.id===t.work)||state.works[0]; let over=t.status==='Просрочена';return `<div class="task-card ${over?'over':''}" data-task="${t.id}" draggable="true" title="Перетащите карточку в нужную колонку"><strong>${t.title}</strong><div class="task-meta">${w.structure} · ${w.construction}</div><div class="task-meta">Срок: <b style="color:${over?'var(--red)':'inherit'}">${t.due}${over?' · просрочено':''}</b></div><div class="task-meta">${t.assignee} · ${t.ready}% готовности</div><span class="status ${statusClass(t.status)}">${t.status}</span></div>`}
function tasksPage(mine=false){let tasks=mine?state.tasks.filter(t=>['Геодезическая служба','ПТО'].includes(t.dept)):state.tasks;let headers=['Новая','В работе','Ожидает данных','На проверке','Выполнена','Просрочена']; return shell(heading(mine?'Мои задачи':'Все задачи',mine?'Перетаскивайте карточки между колонками для смены статуса.':'Контроль задач ответственных подразделений. Перетаскивание обновляет статус.',`<button class="btn" id="task-view">▦ Таблица</button>`)+filters()+`<div class="card"><div class="tabs"><button class="active">Канбан-доска</button><button id="show-task-table">Таблица</button></div><div class="kanban">${headers.map(h=>`<div class="kanban-col" data-kanban-status="${h}"><div class="kanban-head"><span>${h}</span><span>${tasks.filter(t=>t.status===h).length}</span></div>${tasks.filter(t=>t.status===h).map(taskCard).join('')||'<div class="empty-note">Перетащите задачу сюда</div>'}</div>`).join('')}</div></div>`)}
function documentsPage(kind){let config={
 'Исполнительная документация':['Исполнительная документация','Комплектность по выполненным работам','Запись в общем журнале работ','Исполнительная геодезическая схема','Паспорт / сертификат на материал','Акт входного контроля','Лабораторный протокол'],
 'Документы качества':['Документы качества','Реестр паспортов, сертификатов, деклараций и актов входного контроля','Паспорт качества на арматуру А500С','Сертификат на бетон В30 W8','Акт входного контроля № 33','Декларация соответствия гидроизоляции'],
 'Геодезические документы':['Геодезические документы','Задачи гео…62760 tokens truncated…ork:workAt(0),dept:'Администратор',assignee:'Администратор системы',due:'26.07.2026',priority:'Средний',status:'Новая',ready:0,stage:1},
    {id:base+16,title:'Подтвердить актуальность учётных записей участников проекта',work:workAt(0),dept:'Администратор',assignee:'Администратор системы',due:'22.07.2026',priority:'Средний',status:'Выполнена',ready:100,stage:1}
  ];
  state.tasks.push(...tasks);
  state.presentationTaskSet=marker;
  logEvent('Добавлен демонстрационный набор задач по ролям и стадиям реализации.');
  return true;
}
if(ensurePresentationTaskSet()){
  save();
  render();
}

// Расширенный набор для демонстрации распределения нагрузки между ролями.
// Каждая роль получает задачи в разных статусах и на разных видах работ.
function ensureExpandedRoleDemoTasks(){
  const marker='expanded-role-demo-tasks-v1';
  if(state.expandedRoleDemoTasks===marker)return false;
  const workIds=state.works.map(work=>work.id);
  if(!workIds.length)return false;
  const workAt=index=>workIds[index%workIds.length];
  const rolePlans=[
    ['Производитель работ','Петров П.П.',['Оформить запись общего журнала за смену','Подтвердить объём бетонирования захватки','Передать фотофиксацию скрытых работ','Закрыть замечание по организации рабочего места']],
    ['Геодезическая служба','Смирнов Д.В.',['Выполнить разбивку осей сооружения','Загрузить исполнительную схему колонн','Проверить отметки основания котлована','Передать ведомость геодезического контроля']],
    ['Входной контроль','Кузнецов Р.О.',['Проверить паспорт на бетон В30 W8','Зарегистрировать сертификат на арматуру А500С','Оформить акт входного контроля гидроизоляции','Проверить маркировку закладных деталей']],
    ['Строительная лаборатория','Орлов М.С.',['Отобрать контрольные образцы бетона','Загрузить протокол прочности бетона','Провести испытание уплотнения грунта','Передать протокол сварных соединений']],
    ['Строительный контроль','Васильев А.Н.',['Проверить армирование перед бетонированием','Подтвердить освидетельствование скрытых работ','Выдать замечание по защитному слою бетона','Проконтролировать устранение замечания']],
    ['ПТО','Сидоров А.А.',['Проверить комплект исполнительных схем','Сформировать реестр приложений к АОСР','Подготовить проект АОСР по захватке','Проверить устранение замечаний к комплекту ИД']],
    ['Руководитель проекта','Иванов И.И.',['Согласовать критический срок по АОСР','Рассмотреть запрос на разблокировку АОСР','Проверить сводный статус документации','Назначить ответственных по замечаниям']],
    ['Администратор','Администратор системы',['Проверить доступ подрядчика к объекту','Настроить роль нового сотрудника','Проверить резервное копирование портала','Подтвердить актуальность справочников']]
  ];
  const statuses=['Новая','В работе','На проверке','Выполнена'];
  const priorities=['Средний','Высокий','Критичный','Средний'];
  const base=980000;
  const tasks=[];
  rolePlans.forEach(([dept,assignee,titles],roleIndex)=>titles.forEach((title,itemIndex)=>{
    const id=base+roleIndex*10+itemIndex+1;
    tasks.push({id,title,work:workAt(roleIndex*2+itemIndex),dept,assignee,due:`${String(18+roleIndex+itemIndex).padStart(2,'0')}.08.2026`,priority:priorities[itemIndex],status:statuses[itemIndex],ready:[0,45,85,100][itemIndex],stage:dept==='ПТО'||dept==='Руководитель проекта'?2:1});
  }));
  state.tasks.push(...tasks);
  state.expandedRoleDemoTasks=marker;
  logEvent('Добавлены расширенные демонстрационные задачи для всех ролей: '+tasks.length+'.');
  return true;
}
if(ensureExpandedRoleDemoTasks()){
  save();
  render();
}

// Общий реестр задач также соблюдает границы рабочего пространства роли.
// Руководитель проекта и администратор сохраняют сквозной контроль по объекту.
const tasksPageBeforeFinalRoleScope=tasksPage;
tasksPage=function(mine=false){
  const supervisors=['Руководитель проекта','Администратор'];
  if(supervisors.includes(state.role))return tasksPageBeforeFinalRoleScope(mine);
  const permitted=roleTaskDepartments[state.role]||[];
  const originalTasks=state.tasks;
  state.tasks=originalTasks.filter(task=>permitted.includes(task.dept));
  let html=tasksPageBeforeFinalRoleScope(mine);
  state.tasks=originalTasks;
  const roleName=state.role;
  html=html.replace('Контроль задач всех ответственных подразделений.','Задачи, доступные для вашей роли и зоны ответственности.')
           .replace('Показано задач:',`Показано задач (${roleName}):`);
  return html;
};
render();

// Для производственных ролей главная страница показывает единый, персональный
// блок вместо раздельных «Оперативных показателей» и «Оперативного контроля».
const fieldRoles=['Производитель работ','Геодезист','Входной контроль','Лаборатория','Строительная лаборатория','Строительный контроль'];
const dashboardBeforeFieldRoleLayout=dashboard;
dashboard=function(){
  if(!fieldRoles.includes(state.role))return dashboardBeforeFieldRoleLayout();
  const project=activeProject();
  const departments=roleTaskDepartments[state.role]||[];
  const tasks=state.tasks.filter(task=>departments.includes(task.dept));
  const count=status=>tasks.filter(task=>task.status===status).length;
  const active=tasks.filter(task=>!task.blocked&&task.status!=='Выполнена').length;
  const workIds=new Set(tasks.map(task=>task.work));
  const works=state.works.filter(work=>workIds.has(work.id));
  const attention=tasks.filter(task=>['Просрочена','Ожидает данных'].includes(task.status)).slice(0,4);
  const taskButton=(label,value,caption,filter,color='')=>`<button type="button" class="report role-task-link" onclick='window.openRoleTaskFilter(${JSON.stringify(filter)})'><b>${label}</b><div class="num"${color?` style="color:${color}"`:''}>${value}</div><small>${caption}</small></button>`;
  const adminSwitch=currentAuthUser()?.role==='Администратор'?'<button class="btn btn-sm" id="admin-role-switch" title="Переключить режим просмотра">⇄ Переключить роль</button>':'';
  return shell(heading('Главная',`Рабочее пространство роли: ${state.role} · ${project.name}`,adminSwitch)+
    `<div class="card role-operational-dashboard"><div class="card-head"><div><h2>Оперативная работа</h2><p class="source">Ваши показатели и действия по текущему объекту</p></div><button type="button" class="btn btn-sm" onclick="window.openRoleTaskFilter('all')">Открыть мои задачи</button></div><div class="report-grid">${taskButton('Всего задач',tasks.length,'в зоне ответственности','all')}${taskButton('Активные',active,'кроме выполненных','active')}${taskButton('В работе',count('В работе'),'требуют выполнения','В работе')}${taskButton('Ожидают данных',count('Ожидает данных'),'нужно получить сведения','Ожидает данных','var(--orange)')}${taskButton('На проверке',count('На проверке'),'ожидают решения','На проверке')}${taskButton('Просрочено',count('Просрочена'),'требует внимания','Просрочена','var(--red)')}</div></div>`+
    `<div class="grid-2"><div><div class="card"><div class="card-head"><h2>Мои работы по объекту</h2><button class="action" data-page="Выполненные работы">Реестр →</button></div>${works.length?worksTable(works.slice(0,5),true):'<p class="empty-note">За вами пока не закреплены работы.</p>'}</div><div class="card"><div class="card-head"><h2>Мои задачи</h2><button type="button" class="action" onclick="window.openRoleTaskFilter('all')">Все задачи →</button></div>${tasks.slice(0,5).map(taskCard).join('')||'<p class="empty-note">Задач нет.</p>'}</div></div><div><div class="card"><h2>Требуют внимания</h2>${attention.map(task=>`<button type="button" class="critical ${task.status==='Просрочена'?'':'orange'}" onclick='window.openRoleTaskFilter(${JSON.stringify(task.status)})'><b>${auditEsc(task.title)}</b><br><span>Срок: ${auditEsc(task.due)} · ${auditEsc(task.status)}</span></button>`).join('')||'<p class="empty-note">Нет задач, требующих срочных действий.</p>'}</div><div class="card"><h2>Быстрые действия</h2><button type="button" class="btn btn-primary" onclick="window.openRoleTaskFilter('active')">Перейти к активным задачам</button> <button class="btn" data-page="Выполненные работы">Открыть работы</button></div></div></div>`);
};

// Кнопки единого блока открывают только отфильтрованные задачи текущей роли.
const tasksPageBeforeRoleTaskFilter=tasksPage;
tasksPage=function(mine=false){
  const filter=state.roleTaskFilter;
  const originalTasks=state.tasks;
  if(filter&&filter!=='all')state.tasks=originalTasks.filter(task=>filter==='active'?(!task.blocked&&task.status!=='Выполнена'):task.status===filter);
  let html=tasksPageBeforeRoleTaskFilter(mine);
  state.tasks=originalTasks;
  if(filter&&filter!=='all'){
    const label=filter==='active'?'активные задачи':filter.toLowerCase();
    html=html.replace('<div class="card"><div class="tabs">',`<div class="source" style="margin-bottom:12px">Показан фильтр: <b>${label}</b> <button class="btn btn-sm" id="clear-role-task-filter">Сбросить</button></div><div class="card"><div class="tabs">`);
  }
  return html;
};

const bindBeforeRoleTaskFilter=bind;
bind=function(){
  bindBeforeRoleTaskFilter();
  document.querySelectorAll('[data-role-task-filter]').forEach(button=>button.onclick=()=>{
    state.roleTaskFilter=button.dataset.roleTaskFilter;
    delete state.operationalFilter;
    state.page='Все задачи';
    save();
    render();
  });
  const clearRoleFilter=$('#clear-role-task-filter');
  if(clearRoleFilter)clearRoleFilter.onclick=()=>{delete state.roleTaskFilter;save();render()};
};
render();

// Администратор сохраняет возможность выйти из режима просмотра роли даже
// на персонализированной главной странице исполнителя.
function adminRoleSwitchModal(){
  if(currentAuthUser()?.role!=='Администратор')return toast('Переключение ролей доступно только администратору.');
  modal('Переключить роль',`<p class="source">Меняется только режим просмотра. Учётная запись администратора и полный доступ сохраняются.</p><div class="field"><label>Роль для просмотра</label><select id="admin-role-select">${roles.map(role=>`<option ${role===state.role?'selected':''}>${role}</option>`).join('')}</select></div>`,`<button class="btn" data-close>Отмена</button><button class="btn btn-primary" id="apply-admin-role">Применить</button>`);
  $('#apply-admin-role').onclick=()=>{state.role=$('#admin-role-select').value;state.page='Главная';modalRoot.innerHTML='';save();render();toast('Включён режим просмотра: '+state.role+'.')};
}
const bindBeforePersistentAdminRoleSwitch=bind;
bind=function(){
  bindBeforePersistentAdminRoleSwitch();
  const switcher=$('#admin-role-switch');
  if(switcher)switcher.onclick=adminRoleSwitchModal;
};
// Обрабатываем маршрут после подключения всех вариантов render()/tasksPage().
// Так ссылки из персональной главной открывают именно итоговый реестр задач
// с учётом роли, а не промежуточный экран во время загрузки сценария.
const finalRoleTasksRoute = new URLSearchParams(location.search).get('role-tasks');
if (finalRoleTasksRoute) {
  state.roleTaskFilter = finalRoleTasksRoute;
  delete state.operationalFilter;
  state.page = 'Все задачи';
  save();
  history.replaceState(null, '', location.pathname);
}
if(ensureNorthernShoreShowcase()){
  save();
}
function ensureNorthernShoreShowcaseSupplement(){
  const from='northern-shore-showcase-v1',marker='northern-shore-showcase-v2';
  const project=state.projects?.find(item=>item.id==='residential');
  if(!project||project.showcaseSeed===marker||project.showcaseSeed!==from)return false;
  const data=project.id===state.currentProjectId?projectSnapshot():cloneProjectData(project.data||projectInitialData(project));
  const works=data.works.filter(item=>String(item.code||'').startsWith('ЖК-СБ-02-')).slice(-10);
  if(!works.length)return false;
  const additions=[
    ['Производитель работ','Петров П.П.','Подтвердить готовность корпуса к освидетельствованию','В работе'],
    ['Геодезическая служба','Смирнов Д.В.','Загрузить схему фактических отметок','Новая'],
    ['Входной контроль','Кузнецов Р.О.','Проверить документы на бетонную смесь','Ожидает данных'],
    ['Строительная лаборатория','Орлов М.С.','Передать протокол испытаний контрольных кубов','На проверке'],
    ['Строительный контроль','Васильев А.Н.','Подтвердить устранение замечания по защитному слою','Выполнена'],
    ['ПТО','Сидоров А.А.','Сформировать ведомость исполнительной документации корпуса','В работе'],
    ['Руководитель проекта','Иванов И.И.','Согласовать выпуск комплекта документации по корпусу','Просрочена'],
    ['Администратор','Администратор системы','Проверить права подрядчика на документы корпуса','Новая'],
    ['ПТО','Сидоров А.А.','Подготовить сопроводительный лист к АОСР','На проверке'],
    ['Руководитель проекта','Иванов И.И.','Принять решение по критическому замечанию корпуса','Ожидает данных']
  ];
  const base=Math.max(0,...data.tasks.map(item=>Number(item.id)||0))+1;
  const extraTasks=additions.map(([dept,assignee,title,status],index)=>{const work=works[index%works.length],file=`ЖК-СБ-02_доп_${String(index+1).padStart(2,'0')}.pdf`;return {id:base+index,title:`${title}: ${work.structure}`,work:work.id,dept,assignee,due:`${String(1+index).padStart(2,'0')}.09.2026`,priority:index%3===0?'Критичный':'Высокий',status,ready:status==='Выполнена'?100:status==='На проверке'?85:status==='В работе'?55:status==='Ожидает данных'?25:status==='Просрочена'?20:0,stage:['ПТО','Руководитель проекта'].includes(dept)?2:1,attachments:[file]}});
  data.tasks.push(...extraTasks);
  data.uploads.push(...extraTasks.map((task,index)=>{const work=works[index%works.length],file=task.attachments[0];return {kind:['Исполнительная документация','Геодезические документы','Документы качества','Лабораторные протоколы'][index%4],name:`Дополнительный файл по задаче — ${work.structure}`,number:`СБ-Д${String(index+1).padStart(2,'0')}/26`,date:`${String(10+index).padStart(2,'0')}.08.2026`,structure:work.structure,type:'Приложение к задаче',file,linkedWorks:[work.id],reviewStatus:index%3===0?'На проверке':'Принят',reviewComment:''}}));
  data.audit.push({date:'10.08.2026',user:'Администратор системы',role:'Администратор',text:'Демонстрационный набор дополнен до 50 задач.',workId:works[0].id});
  project.data=data;
  project.showcaseSeed=marker;
  if(project.id===state.currentProjectId)projectDataFields.forEach(field=>state[field]=cloneProjectData(data[field]));
  return true;
}
if(ensureNorthernShoreShowcaseSupplement()){
  save();
}
// Единый источник статусов: реестр, карточка работы, АОСР и отчёты используют
// фактическое состояние связанных задач, а не устаревшие демонстрационные поля.
function syncLiveWorkMetrics(){
  if(!Array.isArray(state?.works))return;
  state.works.forEach(work=>{
    const live=liveWorkStatus(work);
    work.ready=live.ready;
    work.missing=live.missing;
    work.aosr=live.aosr;
    work.state=live.overdue?'overdue':'in-progress';
  });
}
const renderBeforeLiveWorkSync=render;
render=function(){syncLiveWorkMetrics();return renderBeforeLiveWorkSync()};
const detailPageBeforeLiveWorkSync=detailPage;
detailPage=function(id,tab='Общая информация'){syncLiveWorkMetrics();return detailPageBeforeLiveWorkSync(id,tab)};
const aosrModalBeforeLiveWorkSync=aosrModal;
aosrModal=function(work){syncLiveWorkMetrics();return aosrModalBeforeLiveWorkSync(work)};
render();
