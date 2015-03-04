(function() {

	

	$( document ).ready(function() {

		var spaces = [];
		var spaces_dict = {};
		var space_selector = $('#space')[0];
		var directory_url = 'http://spaceapi.net/directory.json?filter=and(state.lastchange,state.open)';
		$.ajax({url: directory_url}).done(function (data) {

			spaces_dict = data;

			for (key in spaces_dict) {
				var item = {};
				item.name = key;
				item.url = data[key];
				spaces.push(item);
			}

			spaces.forEach(function (space) {
				var option = document.createElement('option');
				option.value = space.name;
				option.innerHTML = space.name;
				space_selector.appendChild(option);
			});

		});

		$('#cancel').click(function () {
			console.log("Cancel");
			document.location = "pebblejs://close";
		});

		$('#submit').click(function () {
			console.log("Submit");
			document.location = "pebblejs://close#" + encodeURIComponent(JSON.stringify({4: space_selector.value, 3: spaces_dict[space_selector.value] }));
		});
		
	});	

})();