// --- CONTENT ---

$(document).ready(function () {

	if (!window.content || !window.content.projects) return;
	const c = window.content;

	// --- GENERAR SLUGS ---
	c.projects.forEach(project => {
		const title = project.fields?.title || '';
		const slug = title
			.toLowerCase()
			.normalize('NFD')
			.replace(/[\u0300-\u036f]/g, '')
			.replace(/[^\w\s-]/g, '')
			.trim()
			.replace(/\s+/g, '-');

		project.slug = slug;
	});

	const $carousel = $('#archive');
	$carousel.empty();

	function handleResponsive() {
	const isMobile = window.innerWidth <= 768;

	$carousel.empty();

	if (isMobile) {

		// --- MOBILE ---
		c.projects.forEach((project, index) => {
			const category = project.fields.category.toLowerCase();

			const $slide = $('<div>')
				.addClass('thumbnail')
				.attr('data-index', index)
				.attr('data-category', category);

			// Añadir solo la primera imagen del proyecto
			if (project.media && project.media.length > 0) {
				const firstMedia = project.media[0];

				if (firstMedia.type === "image") {
					const $media = $('<img>').attr('src', firstMedia.src);

					if (project.fields.category) {
						const categoryClass = project.fields.category
							.toLowerCase()
							.replace(/\s+/g, '-');
						$media.addClass(categoryClass);
					}

					$slide.append($media);
				}
			}

			// Añadir info (solo mobile)
			if (project.fields) {
				const $fieldsContainer = $('<div>').addClass('list-item');

				if (project.fields.category) {
					const categoryClass = project.fields.category
						.toLowerCase()
						.replace(/\s+/g, '-');
					$fieldsContainer.addClass(categoryClass);
				}

				Object.entries(project.fields).forEach(([key, value]) => {
					$fieldsContainer.append($('<span>').text(value));
				});

				
				$slide.append($fieldsContainer);
			}

			$carousel.append($slide);
		});

	} else {

		// --- DESKTOP ---
		c.projects.forEach((project, index) => {
			const category = project.fields.category.toLowerCase();

			const $slide = $('<div>')
				.addClass('thumbnail')
				.attr('data-index', index)
				.attr('data-category', category);

			// Solo la primera imagen en el carrusel
			if (project.media && project.media.length > 0) {
				const firstMedia = project.media[0];

				if (firstMedia.type === "image") {
					const $media = $('<img>').attr('src', firstMedia.src);

					if (project.fields.category) {
						const categoryClass = project.fields.category
							.toLowerCase()
							.replace(/\s+/g, '-');
						$media.addClass(categoryClass);
					}

					$slide.append($media);
				}
			}

			$carousel.append($slide);
		});

		// Crear lista textual separada
		const $list = $('#list');
		$list.empty();

		c.projects.forEach((project, index) => {
			if (project.fields) {
				const $fields = $('<a>')
					.addClass('list-item')
					.attr('href', `#${project.slug}`)
					.attr('data-index', index);

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

// --- REGISTER IMG SIZES ---
function registerImgs() {
	const imageHeights = new Map();

	document.querySelectorAll('img').forEach(img => {
		function setHeight() {
			const h = img.offsetHeight;
			imageHeights.set(parent, h);
			img.style.height = h + 'px';
		}

		if (img.complete) {
			setHeight();
		} else {
			img.addEventListener('load', setHeight);
		}
	});
}

// --- LIST HOVER ---
$(document).on('mouseenter', '.list-item', function () {
	var index = $(this).data('index');
	setActive(index);
	centerSlide(index);
});

$(document).on('mouseenter', '#archive .thumbnail', function () {
	var $this = $(this);
	var index = $this.data('index');
	setActive(index);
});

$(document).on('touchstart', '#archive .thumbnail', function () {
	$('#archive .thumbnail').not(this).addClass('unactive');
});

$(document).on('touchend', '#archive .thumbnail', function () {
	$('#archive .thumbnail').not(this).removeClass('unactive');
});

function setActive(index) {
	var items = $('.list-item');
	items.removeClass('active unactive');
	items.eq(index).addClass('active');
	items.not(items.eq(index)).addClass('unactive');

	var posts = $('#archive .thumbnail');
	posts.removeClass('active unactive');
	posts.filter(`[data-index="${index}"]`).addClass('active');
	posts.not(posts.filter(`[data-index="${index}"]`)).addClass('unactive');
}

function centerSlide(index) {
	var $container = $('#gallery-container');
	var $slide = $('#archive .thumbnail').filter(`[data-index="${index}"]`).first();

	if ($slide.length) {
		var containerScroll = $container.scrollTop();
		var containerHeight = $container.height();
		var slideTop = $slide.position().top + containerScroll;
		var slideHeight = $slide.outerHeight(true);
		var scrollTo = slideTop + slideHeight / 2 - containerHeight / 2;
		$container.stop().animate({ scrollTop: scrollTo }, 2000, 'easeOutQuad');
	}
}

// --- CATEGORY FILTER ---
$(document).ready(function () {
	const filmButton = $('#film-button');
	const photoButton = $('#photo-button');

	const postPhoto = $('.photo');
	const postFilm = $('.film');

	filmButton.on('click', function () {
		$(this).toggleClass('active');
		$(this).siblings().removeClass('active');
		postPhoto.toggleClass('filter');
		postFilm.removeClass('filter');
	});

	photoButton.on('click', function () {
		$(this).toggleClass('active');
		$(this).siblings().removeClass('active');
		postFilm.toggleClass('filter');
		postPhoto.removeClass('filter');
	});
});

// --- PROJECT ROUTING WITH HASH ---
$(document).on('click', '.list-item, #archive .thumbnail a', function (e) {
	e.preventDefault(); // prevenir recarga
	const href = $(this).attr('href'); // ejemplo: "#parajumpers"
	const slug = href.substring(1);    // quitar el '#'

	history.pushState({ slug }, '', href);
	showProject(slug);
});

$(window).on('popstate', function () {
	const hash = window.location.hash; // ejemplo: "#parajumpers"
	if (hash) {
		const slug = hash.substring(1);
		showProject(slug);
	} else {
		handleResponsive(); // volver al listado
	}
});

$(document).ready(function () {
	const hash = window.location.hash;
	if (hash) {
		const slug = hash.substring(1);
		showProject(slug);
	}
});

function showProject(slug) {
	const project = window.content.projects.find(p => p.slug === slug);
	const container = $('#gallery-container');
	if (!project) return;

	container.empty();
	container.addClass('single-view');
	$('#list').empty();

	const category = project.fields.category.toLowerCase();

	const $postContainer = $('<div>').attr('id', 'post');

	const singleGallery = $('<div>').attr('id', 'single-gallery');

	if (project.media && project.media.length > 0) {
		project.media.forEach((m, i) => {
			if (m.type === 'image') {
				const $img = $('<img>')
					.attr('src', m.src)
					.attr('alt', project.fields.title)
					.addClass('post-image')
					.toggleClass('active', i === 0);
				singleGallery.append($img);
			}
		});
	}

	$postContainer.append(singleGallery);

	// single thumbnails

	const $thumbContainer = $('<div>').attr('id', 'thumbnails');
	if (project.media && project.media.length > 0) {
		project.media.forEach((m, i) => {
			if (m.type === 'image') {
				const $thumb = $('<img>')
					.attr('src', m.src)
					.attr('alt', project.fields.title)
					.addClass('thumbnail-item')
					.toggleClass('active', i === 0);
				$thumbContainer.append($thumb);
			}
		});
	}
	$postContainer.append($thumbContainer);

	// single index

	const singleIndex = $('<div>').attr('id', 'single-index');

	const relatedProjects = window.content.projects.filter(
		p => p.fields.category.toLowerCase() === category
	);

	relatedProjects.forEach(p => {
		const $item = $('<div>');
		const $link = $('<a>')
			.attr('href', `#${p.slug}`)
			.text(p.fields.title);

		if (p.slug === slug) $link.addClass('active');

		$item.append($link);
		singleIndex.append($item);
	});

	$postContainer.append(singleIndex);

	// credits

	const creditsButton = $('<div>').attr('id', 'credits-button');
	const creditsButtonText = $('<a>').text('Credits');

	creditsButton.append(creditsButtonText);
	$postContainer.append(creditsButton);

	const creditsContainer = $('<div>').attr('id', 'credits');

	if (project.credits) {
		
		const entries = Object.entries(project.credits);

		entries.forEach(([key, value], index) => {
			creditsContainer.append($('<span>').text(value));
			if (index < entries.length - 1) {
				creditsContainer.append($('<span>').text(' / '));
			}
		});

		$postContainer.append(creditsContainer);
	}

	container.append($postContainer);

	const creditsHeight = creditsContainer.outerHeight(); 

	console.log(creditsHeight);

	// functions

	$('#thumbnails .thumbnail-item').on('mouseenter', function () {
		const index = $(this).index();

		$('#thumbnails .thumbnail-item').removeClass('active');
		$(this).addClass('active');

		$('#post .post-image').removeClass('active');
		$('#post .post-image').eq(index).addClass('active');
	});

	creditsButton.on('click', function () {

		creditsButton.toggleClass('active');
		const creditsHeight = creditsContainer.outerHeight();

		singleGallery.toggleClass('credits');
		singleIndex.toggleClass('credits');

		creditsContainer.toggleClass('active');

		document.documentElement.style.setProperty('--credits-height', `-${creditsHeight}px`);
	});
};

// about

$(document).ready(function () {

	const aboutButton = $('#about-button');
	const about = $('#about');
	
	aboutButton.on('click', function () {
		about.toggleClass('active');
		aboutButton.toggleClass('active');
	});
});