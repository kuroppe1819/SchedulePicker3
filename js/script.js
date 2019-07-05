chrome.extension.onMessage.addListener(function(menuItem) {
  chrome.storage.sync.get(null, function(items) {
	  // 現在フォーカスが与えられている要素を取得する
	 	const active_element = document.activeElement;

		 // フォーカスしている部分を取得
		const target_area = active_element.id;
		const target = document.getElementById(target_area);

		// フォーカスしていなかったら処理をやめる
		if (target_area === '') return;

		// 日付処理
		let date;
		const today = moment();
		let tomorrow;
		// todayが金曜なら、tomorrowを翌週の月曜にする
		if (moment().day() === 5) tomorrow = moment(today).add(3, 'd');
		else tomorrow = moment(today).add(1, 'd');
		// オプション画面の日付情報を取得
		const selected_date = items.select;
		//date変数にそれぞれの場合の日付を代入
		switch (menuItem.title) { // FIXME menuItem.parentId or menuItem.id で分岐したい
			case 'Today':
			case 'Template':
				date = today;
				break;
			case 'Tomorrow':
				date = tomorrow;
				break;
			default:
				date = moment(selected_date);
				break;
		}

		//RESTで取得したJSON形式のスケジュール情報をもとに処理を行う
		getSchedule(date).done(function(json) {
			const schedule = formatSchedule($(json));
			// オプション画面の非公開予定の値
			const type = items.secret;
			const form = items.form;

			// スケジュールの挿入部分
			switch (menuItem.title) {  // FIXME menuItem.parentId or menuItem.id で分岐したい
				case 'Today':
					target.innerHTML += makehtml(schedule, type, today.format('YYYY-MM-DD'));
					break;
				case 'Tomorrow':
					target.innerHTML += makehtml(schedule, type, tomorrow.format('YYYY-MM-DD'));
					break;
				case 'Template':
					getSchedule(tomorrow).done(function(tomorrow_json) {
						const tomorrow_schedule = formatSchedule($(tomorrow_json));
						target.innerHTML += makeForm(form, schedule, tomorrow_schedule, type, today, tomorrow);
					});
					break;
				default:
					target.innerHTML += makehtml(schedule, type, selected_date);
					break;
			}
			
		});
	});
});
