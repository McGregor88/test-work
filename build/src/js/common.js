var scrollSpeed = 800;

$(document).ready(function() {

	// Mask
	if ($("input[type='tel']").length) {
		$("input[type='tel']").mask("+ 7 (999) 999-99-99");
	}

	// Scroll
	if ($(".js-scroll").length) {

		$(".js-scroll").on("click", function(e) {   
			e.preventDefault();
			var id = $(this).attr("href");

			$('html, body').animate({
				scrollTop: $(id).offset().top
			}, scrollSpeed)
		})

	}

	// Form
	if ($(".form").length) {
		$(".form").one("mouseenter", function() {
			
			$(this).validate({
				errorElement: "div",
				errorPlacement: function(error, element) {
					element.after(error);
				},
				messages: {
					phone: {
						required: "Введите номер телефона!"
					}
				},
			});

		})
	}

	$(document).on("submit", ".form", function(e) {
		e.preventDefault();
		var _form = $(this);

		// Make ajax request to server
		$.ajax({
			url: _form.data("url") || "assets/ajax/callback.php",
			data: {
				form: _form.serialize()
			},
			type: "POST",
			beforeSend: function() {
				if (_form.data("is-modal")) {
					var fancy = $.fancybox.getInstance();
					
					fancy.showLoading();
				}
			},
			success: function(data) {
				try {
					data = $.parseJSON(data);
					if (data.result) {

						var success_title = _form.find("[name='success_title']").val() || "";
						var success_msg = _form.find("[name='success_message']").val() || "";
						var success = $("#success");

						success.find(".popup-title").html(success_title);
						success.find(".success-message p").html(success_msg);

						setTimeout(function() {
							if (_form.data("is-modal")) {
								$.fancybox.close(true);
							}

							// Show fancybox
							$.fancybox.open({
								src: "#success",
								type: "inline",
								touch: null
							});
						}, 500);
					} else {
						alert(data.data);
					}
				} catch (e) {
					console.info(data);
				}
				
				if (_form.data("is-modal")) {
					var fancy = $.fancybox.getInstance();
					fancy.hideLoading();
				}

				$(_form).trigger("reset");
			},
			complete: function(jqXHR, textStatus) {
				if (_form.data("is-modal")) {
					var fancy = $.fancybox.getInstance();
					fancy.hideLoading();
				}

				$(_form).trigger("reset");
			},
			error: function(jqXHR, textStatus, errorThrown) {
				console.info(textStatus + " " + errorThrown);
			}
		}); // ajax end
	});

	console.log(1);

});
