const body = document.querySelector('.content');

fetch('./xbrl_validation.json').then(response => response.json()).then(
	data => {

		data.assertsDetails[0].asserts.forEach(obj => {

			const assert = new Assert(obj);
			body.append(assert.getElement());
		});
	});
