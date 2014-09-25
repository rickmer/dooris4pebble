(function() {

	var spaces = [];

	$( document ).ready(function() {

		var space_selector = $('#space')[0];
		var directory_url = 'http://spaceapi.net/directory.json?filter=and(state.lastchange,state.open)';
		$.ajax({url: directory_url}).done(function (data) {

			for (key in data) {
				var item = {};
				item.name = key;
				item.url = data[key];
				spaces.push(item);
			}

			spaces.forEach(function (space) {
				var option = document.createElement('option');
				option.value = space.url;
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
			document.location = "pebblejs://close#" + encodeURIComponent(JSON.stringify({'url':space_selector.value}));
		});
		
	});
	

})();