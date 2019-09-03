const formatTime = function(object) {
  return object.split('T')[1].split('+')[0].split(':',2).join(':');
};

const checkEventType = function(ele, type) {
  if (ele.visibilityType === 'PRIVATE' && !type) return;
  text += '<div class="listTime" style="white-space: pre-wrap;">'
  if (ele.isAllDay) text += set_eventMenu('終日');
  if (ele.isStartOnly) {
    if (ele.eventType === 'REPESTING') str_start_datetime = formatTime(ele.start.dateTime);
    else str_start_datetime = formatTime(ele.start.dateTime);
    text += str_start_datetime + ' ';
  } else {
    str_start_datetime =formatTime(ele.start.dateTime);
    str_end_datetime = formatTime(ele.end.dateTime);
    text += str_start_datetime+ '-' + str_end_datetime + ' ';
  }

  if (ele.eventMenu !== '') text += set_eventMenu(ele.eventMenu);
  text += '<a href = "https://bozuman.cybozu.com/g/schedule/view.csp?event=' + ele.id + '" >' + ele.subject + '</a>';
  if (ele.eventType === 'REPESTING') text += '<img src="https://static.cybozu.com/g/F18.8_495/grn/image/cybozu/repeat16.gif?20180719.text" border="0" style="vertical-align: -3px;">';
  text += '</div>'
};

const makehtml = function(schedule, type, date) {
  let html_text = '';
  html_text += '<div>【' + date + '】の予定</div>';

  schedule.forEach(function(element) {
    text = '';
    switch (element.eventType) {
      case 'REPEATING':
      {
        checkEventType(element, type);
        break;
      }
      case 'REGULAR':
      {
        checkEventType(element, type);
        break;
      }
    }
    html_text = html_text + text;
  }, this);
  html_text = html_text + '</div>'
  return html_text;
};

const set_eventMenu = function(plan) {
  plan_color = plan_list(plan);
  plan_text = '<span class="event_color1_grn" style="background-color: rgb(' +
  plan_color.r + ',' + plan_color.g + ',' + plan_color.b +
  '); display: inline-block; margin-right: 3px; padding: 2px 2px 1px; color: rgb(255, 255, 255); font-size: 11.628px; border-radius: 2px; line-height: 1.1;">'
  plan_text += plan + '</span>';
  return plan_text;
};
