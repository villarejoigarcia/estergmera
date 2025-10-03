// content

$(document).ready(function () {

	if (!window.content || !window.content.projects) return;
	const c = window.content;

	const $carousel = $('#gallery');
	$carousel.empty();

	function handleResponsive() {
		const isMobile = window.innerWidth <= 768;

		if (isMobile) {

			$carousel.empty();

			c.projects.forEach((project, index) => {
				const $slide = $('<div>')
					.addClass('post')
					.attr('data-index', index);

				if (project.media) {
					project.media.forEach(m => {
						if (m.type === "image") {
							const $media = $('<img>').attr('src', m.src);
							$slide.append($media);
						}
					});
				}

				if (project.fields) {
					const $fieldsContainer = $('<div>').addClass('list-item');
					Object.entries(project.fields).forEach(([key, value]) => {
						$fieldsContainer.append($('<span>').text(value));
					});
					$slide.append($fieldsContainer);
				}

				$carousel.append($slide);
			});			

		} else {

			c.projects.forEach((project, index) => {
				const $slide = $('<div>')
					.addClass('post')
					.attr('data-index', index);

				if (project.media) {
					project.media.forEach(m => {
						if (m.type === "image") {
							const $media = $('<img>').attr('src', m.src);
							$slide.append($media);
						}
					});
				}

				$carousel.append($slide);
			});

			const $list = $('#list');
			$list.empty();

			c.projects.forEach((project, index) => {

				if (project.fields) {
					const $fields = $('<a>').addClass('list-item');
					$fields.append($('<span>').addClass('index').text(`${index + 1}.`));
					Object.entries(project.fields).forEach(([key, value]) => {
						$fields.append($('<span>').text(value));
					});
					$list.append($fields);
				}

			});

		}
	}

	handleResponsive();

	$(window).on('resize', function () {
		handleResponsive();
	});

});

// js

const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints;

const eventType = isTouchDevice ? 'touchstart' : 'mouseenter';

$(document).on(eventType, '.list-item', function (e) {
    e.preventDefault();
    var index = $(this).index();
    setActive(index);
    centerSlide(index);
});

$(document).on(eventType, '#gallery .post', function (e) {
    e.preventDefault();
    var index = $(this).data('index');
    setActive(index);
});

function setActive(index) {
    var items = $('.list-item');
    items.removeClass('active unactive');
    items.eq(index).addClass('active');
    items.not(items.eq(index)).addClass('unactive');

    var posts = $('#gallery .post');
    posts.removeClass('active unactive');
    posts.not(posts.filter(`[data-index="${index}"]`)).addClass('unactive');
}

function centerSlide(index) {
    var $container = $('#gallery-container');
    var $slide = $('#gallery .post').filter(`[data-index="${index}"]`).first();

    if ($slide.length) {
        var containerScroll = $container.scrollTop();
        var containerHeight = $container.height();
        var slideTop = $slide.position().top + containerScroll;
        var slideHeight = $slide.outerHeight(true);
        var scrollTo = slideTop + slideHeight / 2 - containerHeight / 2;
        $container.stop().animate({ scrollTop: scrollTo }, 1000, 'easeOutQuad');
    }
}