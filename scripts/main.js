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

			$carousel.empty();

			c.projects.forEach((project, index) => {
				const $slide = $('<div>')
					.addClass('post')
					.attr('data-index', index);

				if (project.fields && project.fields.category) {
					const categoryClass = project.fields.category
						.toLowerCase()
						.replace(/\s+/g, '-');

					$slide.addClass(categoryClass);
				}

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
					const $fields = $('<a>')
						.addClass('list-item');

					if (project.fields.category) {
						$fields.addClass(project.fields.category.toLowerCase().replace(/\s+/g, '-'));
					}

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

	let lastIsMobile = window.innerWidth <= 768;

	$(window).on('resize', function () {
		const isMobile = window.innerWidth <= 768;
		if (isMobile !== lastIsMobile) {
			handleResponsive();
			lastIsMobile = isMobile;
		}
	});

	registerImgs();

});

// js

// register img sizes

function registerImgs() {
	const imageHeights = new Map();

	document.querySelectorAll('img').forEach(img => {
		function setHeight() {
			const h = img.offsetHeight;
			const parent = img.closest('.post');
			if (!parent) return;

			imageHeights.set(parent, h);
			parent.style.height = h + 'px';
		}

		if (img.complete) {
			setHeight();
		} else {
			img.addEventListener('load', setHeight);
		}
	});

}

// list

$(document).on('mouseenter', '.list-item', function () {
	var index = $(this).index();
	setActive(index);
	centerSlide(index);
});

$(document).on('mouseenter', '#gallery .post', function () {
	var $this = $(this);
	var index = $this.data('index');
	setActive(index);
});

$(document).on('touchstart', '#gallery .post', function () {
	$('#gallery .post').not(this).addClass('unactive');
});

$(document).on('touchend', '#gallery .post', function () {
	$('#gallery .post').not(this).removeClass('unactive');
});

function setActive(index) {
    var items = $('.list-item');
    items.removeClass('active unactive');
    items.eq(index).addClass('active');
    items.not(items.eq(index)).addClass('unactive');

	var posts = $('#gallery .post');
    posts.removeClass('active unactive');
    posts.filter(`[data-index="${index}"]`).addClass('active');
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

// category filter

$(document).on('click', '#film-button', function () {
	const unactivePosts = $('.photo');

	$(this).toggleClass('active');
	unactivePosts.toggleClass('filter');
});

$(document).on('click', '#photo-button', function () {
	const unactivePosts = $('.film');

	$(this).toggleClass('active');
	unactivePosts.toggleClass('filter');
});