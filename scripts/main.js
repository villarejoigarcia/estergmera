// content

$(document).ready(function () {

	if (!window.content || !window.content.projects) return;
	const c = window.content;

	// about

	const bioContainer = $('#bio');
	bioContainer.empty();

	const bio = $('<p>');
	bio.append(c.about.bio);
	bioContainer.append(bio);

	// contact 

	const contact = $('#not-social');
	contact.empty();

	const mailUrl = c.about.contact.mail;
	const phoneUrl = c.about.contact.phone;

	const mail = $('<a>')
		.attr('href', `mailto:${mailUrl}`)
		.text(mailUrl);

	contact.append(mail);

	const phone = $('<a>')
		.attr('href', `tel:${phoneUrl}`)
		.text(phoneUrl);

	contact.append(phone);

	// social

	const socialContainer = $('#social');
	socialContainer.empty();

	
	Object.entries(c.about.social).forEach(([key, item]) => {
		const link = $('<a>')
			.attr('href', item)
			.attr('target', '_blank')
			.text(key);

		socialContainer.append(link);
	});

	// // press

	// const press = $('#press .main');
	// press.empty();

	// c.press.forEach(item => {
	// 	const link = $('<a>')
	// 		.attr('href', item.url)
	// 		.attr('target', '_blank')
	// 		.text(item.title); 

	// 		press.append(link);
	// });

	// const otherPress = $('#press .other');
	// otherPress.empty();

	// c.otherPress.forEach(item => {
	// 	const link = $('<a>')
	// 		.attr('href', item.url)
	// 		.attr('target', '_blank')
	// 		.text(item.title); 

	// 		otherPress.append(link);
	// });

	// slugs

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

	// load

	function handleResponsive() {
		const isMobile = window.innerWidth <= 768;

		const $carousel = $('#archive');
		$carousel.empty();

		const press = $('#press .main');
		press.empty();

		const otherPress = $('#press .other');
		otherPress.empty();

		if (isMobile) {

			// mobile

			c.projects.forEach((project, index) => {
				const categories = Array.isArray(project.fields.category)
					? project.fields.category
					: [project.fields.category || ''];

				const $slide = $('<a>')
					.addClass('thumbnail')
					.attr('href', `#${project.slug}`)
					.attr('data-index', index)
					.attr('data-category', categories.join(',').toLowerCase());

				// Añadir clases de categoría
				categories.forEach(cat => {
					const categoryClass = cat.trim().toLowerCase().replace(/\s+/g, '-');
					$slide.addClass(categoryClass);
				});

				// Media
				if (project.media && project.media.length > 0) {
					const firstMedia = project.media[0];
					let $media;

					if (firstMedia.type === "image") {
						$media = $('<img>').attr('src', firstMedia.src);
						$slide.append($media);

					} else if (firstMedia.type === "video") {
						const videoId = firstMedia.id;
						const vimeoUrl = `https://player.vimeo.com/video/${videoId}?autoplay=1&muted=1&loop=1&background=1`;

						const $iframe = $('<iframe>')
							.attr('src', vimeoUrl)
							.attr('frameborder', '0')
							.attr('allow', 'autoplay; fullscreen; picture-in-picture')
							.addClass('load');

						const player = new Vimeo.Player($iframe[0]);

						$slide.data('player', player);

						Promise.all([player.getVideoWidth(), player.getVideoHeight()])
							.then(([w, h]) => {
								const ratio = w / h;
								$iframe[0].style.aspectRatio = ratio;
								setHeight();
							});

						if (firstMedia.start !== undefined && firstMedia.end !== undefined) {
							const start = Number(firstMedia.start);
							const end = Number(firstMedia.end);
							player.ready().then(() => {
								player.setCurrentTime(start).then(() => player.play());
							});
							player.on('timeupdate', data => {
								if (data.seconds >= end) {
									player.setCurrentTime(start).then(() => player.play());
								}
							});

							player.on('play', () => {
								$iframe[0].classList.remove('load');
							});

						} else {
							player.ready().then(() => player.play()).catch(() => { });
						}

						$slide.append($iframe);
					}
				}

				// Info
				if (project.fields) {
					const $fieldsContainer = $('<div>').addClass('post-data');
					
					Object.entries(project.fields).forEach(([key, value]) => {
						if (Array.isArray(value)) {
							$fieldsContainer.append($('<span>').text(value.join('/')));
						} else {
							$fieldsContainer.append($('<span>').text(value));
						}
					});
					
					$slide.append($fieldsContainer);
				}

				$carousel.append($slide);
			});

			// press

			c.press.forEach(item => {
				const link = $('<a>')
					.attr('href', item.url)
					.attr('target', '_blank')
					.text(item.title);

				press.append(link);
			});

			c.otherPress.forEach(item => {
				const link = $('<a>')
					.attr('href', item.url)
					.attr('target', '_blank')
					.text(item.title);

				press.append(link);
			});

			$('#press-button').text('+ View');

		} else {

			// desktop

			c.projects.forEach((project, index) => {
				const categories = project.fields.category;

				const $slide = $('<a>')
					.addClass('thumbnail')
					.attr('data-index', index)
					.attr('href', `#${project.slug}`)

				// Añadir clases de categoría
				categories.forEach(cat => {
					const categoryClass = cat.trim().toLowerCase().replace(/\s+/g, '-');
					$slide.addClass(categoryClass);
				});

				// Media
				if (project.media && project.media.length > 0) {
					const firstMedia = project.media[0];
					let $media;

					if (firstMedia.type === "image") {
						$media = $('<img>').attr('src', firstMedia.src);
						$slide.append($media);

						const imageCount = project.media.filter(m => m.type === "image").length;
						const text = imageCount.toString();
						project.fields.duration = text;

						const $durationField = $(`#list .list-item[data-index="${index}"]>*:last-child`);
						if ($durationField.length) $durationField.text(text);

					} else if (firstMedia.type === "video") {

						const videoId = firstMedia.id;

						const vimeoUrl = `https://player.vimeo.com/video/${videoId}?autoplay=1&muted=1&loop=1&background=1`;

						const $iframe = $('<iframe>')
							.attr('src', vimeoUrl)
							.attr('frameborder', '0')
							.attr('allow', 'autoplay; fullscreen; picture-in-picture')
							.addClass('load');

						const player = new Vimeo.Player($iframe[0]);

						$slide.data('player', player);

						Promise.all([player.getVideoWidth(), player.getVideoHeight()])
							.then(([w, h]) => {
								const ratio = w / h;
								$iframe[0].style.aspectRatio = ratio;
								setHeight();
							});

						if (firstMedia.start !== undefined && firstMedia.end !== undefined) {
							const start = Number(firstMedia.start);
							const end = Number(firstMedia.end);

							player.ready().then(() => {
								player.setCurrentTime(start).then(() => player.play());
							});

							player.on('timeupdate', data => {
								if (data.seconds >= end) {
									player.setCurrentTime(start).then(() => player.play());
								}
							});

							player.on('play', () => {
								$iframe[0].classList.remove('load');
							});

							player.on('loaded', () => {
								player.getDuration().then(durationSeconds => {
									const minutes = Math.floor(durationSeconds / 60);
									const seconds = durationSeconds % 60;
									const formattedDuration = `${minutes}:${seconds.toString().padStart(2, '0')}`;

									const imageCount = project.media.filter(m => m.type === "image").length;
									const imageText = imageCount > 0 ? `/${imageCount} img` : "";

									const finalText = `${formattedDuration}${imageText}`;
									project.fields.duration = finalText;

									const $durationField = $(`#list .list-item[data-index="${index}"]>*:last-child`);
									if ($durationField.length) $durationField.text(finalText);

								});
							});

						} else {
							player.ready().then(() => player.play()).catch(() => { });
						}

						$slide.append($iframe);
					}
				}

				$carousel.append($slide);
			});

			// list

			const $list = $('#list');
			$list.empty();

			c.projects.forEach((project, index) => {
				const categories = project.fields.category;

				if (project.fields) {
					const $fields = $('<a>')
						.addClass('list-item')
						.attr('href', `#${project.slug}`)
						.attr('data-index', index)

					categories.forEach(cat => {
						const categoryClass = cat.trim().toLowerCase().replace(/\s+/g, '-');
						$fields.addClass(categoryClass);
					});

					$fields.append($('<span>').addClass('index').text(`${index + 1}.`));

					Object.entries(project.fields).forEach(([key, value]) => {
						const div = $('<div>').addClass(key);
						if (Array.isArray(value)) {
							const span = $('<span>').text(value.join('/'));
							div.append(span);
						} else {
							const span = $('<span>').text(value);
							div.append(span);
						}
						$fields.append(div);
					});

					$list.append($fields);
				}
			});

			// list

			c.press.forEach(item => {
				const link = $('<a>')
					.attr('href', item.url)
					.attr('target', '_blank')
					.text(item.title);

				press.append(link);
			});

			c.otherPress.forEach(item => {
				const link = $('<a>')
					.attr('href', item.url)
					.attr('target', '_blank')
					.text(item.title);

				otherPress.append(link);
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

	// categories

	const container = $('#gallery-container');

	const filmButton = $('#film-button');
	const photoButton = $('#photo-button');

	filmButton.on('click', function () {

		const postPhoto = $('.photo');
		const postFilm = $('.film');

		if (container.hasClass('single-view')) {
			// Clear URL hash
			history.pushState({}, '', window.location.pathname);

			container.children().addClass('hide');
			$('#single-index').addClass('hide');
			$('#loading').addClass('hide');
			setTimeout(() => {

				container.removeClass('single-view');
				container.empty();

				const archive = $('<div>').attr('id', 'archive').addClass('hide');
				container.append(archive);

				const list = $('<div>').attr('id', 'list').addClass('hide');
				container.append(list);
				handleResponsive();
				const postPhoto = $('.photo:not(.film.photo)');

				$('#single-index').empty();
				$('#loading').empty();

				setTimeout(() => {
					archive.removeClass();
					list.removeClass();
					postPhoto.addClass('filter');
				}, 2000);
			}, 500);
		} else {
			console.log('home');
			postPhoto.toggleClass('filter');
			postFilm.removeClass('filter');
		}
		$(this).toggleClass('active');
		$(this).siblings().removeClass('active');
	});

	photoButton.on('click', function () {
		const postPhoto = $('.photo');
		const postFilm = $('.film');

		if (container.hasClass('single-view')) {
			// Clear URL hash
			history.pushState({}, '', window.location.pathname);

			container.children().addClass('hide');
			$('#single-index').addClass('hide');
			$('#loading').addClass('hide');
			setTimeout(() => {

				container.removeClass('single-view');
				container.empty();

				const archive = $('<div>').attr('id', 'archive').addClass('hide');
				container.append(archive);

				const list = $('<div>').attr('id', 'list').addClass('hide');
				container.append(list);
				handleResponsive();
				const postFilm = $('.film:not(.film.photo)');

				$('#single-index').empty();
				$('#loading').empty();

				setTimeout(() => {
					archive.removeClass();
					list.removeClass();
					postFilm.addClass('filter');
				}, 2000);
			}, 500);
		} else {
			console.log('home');
			postFilm.toggleClass('filter');
			postPhoto.removeClass('filter');
		}
		$(this).toggleClass('active');
		$(this).siblings().removeClass('active');
	});

});

// img sizes

function setHeight() {

	const thumbnails = document.querySelectorAll('.thumbnail');

	thumbnails.forEach(thumbnail => {
		thumbnail.style.height = '';
		const currentHeight = thumbnail.offsetHeight;
		thumbnail.style.height = `${currentHeight}px`;
	});

}

let resizeTimer = null;

$(window).on('resize', () => {
	clearTimeout(resizeTimer);
	resizeTimer = setTimeout(() => {
		setHeight();
	}, 666);
});

// list

let lastMousePos = { x: 0, y: 0 };
let hoverTimer = null;
const stopThreshold = 1;
const stopDelay = 50;
let currentActiveIndex = null;

$(document).on('mousemove', function (e) {
    const dx = Math.abs(e.pageX - lastMousePos.x);
    const dy = Math.abs(e.pageY - lastMousePos.y);

    lastMousePos.x = e.pageX;
    lastMousePos.y = e.pageY;

    if (dx > stopThreshold || dy > stopThreshold) {
        clearTimeout(hoverTimer);
    }

    hoverTimer = setTimeout(() => {

        const $target = $(document.elementFromPoint(e.clientX, e.clientY))
            .closest('.list-item .title>*');

        if ($target.length) {
            const index = $target.parent().parent().data('index');
			if (index === currentActiveIndex) return;
			currentActiveIndex = index;
            setActive(index);
            centerSlide(index);
        } 

    }, stopDelay);
});

const gallery = document.getElementById('gallery-container');
const list = document.getElementById('list');

list.addEventListener('wheel', (e) => {
    e.preventDefault();
    gallery.scrollBy({
        top: e.deltaY,
        behavior: 'auto'
    });
});

function checkActivePostOnScroll() {
	const isMobile = window.innerWidth <= 768;
	const $container = isMobile ? $(window) : $('#gallery-container');
	const containerScroll = $container.scrollTop();
	const containerHeight = isMobile ? window.innerHeight : $container.height();
	const scrollBottom = containerScroll + containerHeight;
	const scrollHeight = isMobile ? $(document).height() : $container[0].scrollHeight;

	const $allThumbnails = $('#archive .thumbnail');
	const $thumbnails = $allThumbnails.filter(function () {
		return $(this).outerHeight() > 0;
	});

	if ($thumbnails.length === 0) return;

	let activeIndex = null;

	const $first = $thumbnails.first();
	const $last = $thumbnails.last();

	if (containerScroll <= 0) {
		activeIndex = $first.data('index');
	} else if (scrollBottom >= scrollHeight - 1) {
		activeIndex = $last.data('index');
	} else {
		$thumbnails.each(function () {
			const $thumb = $(this);
			const thumbTop = isMobile ? $thumb.offset().top : $thumb.position().top;
			const thumbScroll = isMobile ? containerScroll : 0;

			if (thumbTop <= (containerHeight / 2) + thumbScroll) {
				activeIndex = $thumb.data('index');
			}
		});
	}

	if (activeIndex !== null) setActive(activeIndex);
}

$('#gallery-container').on('scroll', function () {
	if (window.innerWidth > 768) checkActivePostOnScroll();
});

$(window).on('scroll', function () {
	if (window.innerWidth <= 768) checkActivePostOnScroll();
});

let currentActiveVideo = null;

function setActive(index) {
	if (index === currentActiveVideo) return;
	currentActiveVideo = index;

	const items = $('.list-item, .post-data');
	items.removeClass('active unactive');
	items.eq(index).addClass('active');
	items.not(items.eq(index)).addClass('unactive');

	const posts = $('#archive .thumbnail');
	posts.removeClass('active unactive');

	const activePost = posts.filter(`[data-index="${index}"]`);
	activePost.addClass('active');
	posts.not(activePost).addClass('unactive');

	posts.each(function () {
		const player = $(this).data('player');
		if (player) player.pause();
	});

	const activePlayer = activePost.data('player');
	if (activePlayer) activePlayer.play().catch(() => { });
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
		$container.stop().animate({ scrollTop: scrollTo }, 1000, 'easeOutQuad');
	}
}

// url

$(document).on('click', '.list-item, #archive .thumbnail a, #single-index a', function (e) {
	e.preventDefault();
	const slug = $(this).attr('href').substring(1);

	history.pushState({ slug }, '', `#${slug}`);
	showProject(slug);
});

$(window).on('popstate', function () {
	const hash = window.location.hash;
	if (hash) {
		const slug = hash.substring(1);
		showProject(slug);
	} else {
		handleResponsive();
	}
});

$(document).ready(function () {
	const hash = window.location.hash;
	if (hash) {
		const slug = hash.substring(1);
		showProject(slug);
	}
});

// single

function showProject(slug) {
	const project = window.content.projects.find(p => p.slug === slug);
	const container = $('#gallery-container');
	const transition = 1000;

	$('nav>*').removeClass('active');

	if (!project) return;

	container.children().addClass('hide');

	setTimeout(() => {
		container.empty();
	}, transition);

	container.addClass('single-view');

	const categories = Array.isArray(project.fields.category)
		? project.fields.category
		: [project.fields.category || ''];
	const category = categories[0].trim().toLowerCase();

	const $postContainer = $('<div>').attr('id', 'post').addClass('hide');

	// title

	const titleDiv = $('<div>').addClass('post-data');

	const titleText = project.fields?.title || '';
	// Try common client field names (adapt if your data uses a different key)
	const clientText = project.fields?.client || project.fields?.client_name || project.fields?.cliente || '';
	const categoriesText = Array.isArray(project.fields?.category)
		? project.fields.category.join('/')
		: (project.fields?.category || '');

	// Name / Client / Category similar to mobile thumbnail post-data
	titleDiv.append($('<span>').addClass('project-title').text(titleText));
	if (clientText) titleDiv.append($('<span>').addClass('project-client').text(clientText));
	if (categoriesText) titleDiv.append($('<span>').addClass('project-category').text(categoriesText));

	$postContainer.append(titleDiv);
	

	// media

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

			} else if (m.type === "video") {

				const videoId = m.id;
				const vimeoUrl = `https://player.vimeo.com/video/${videoId}?autoplay=0&muted=1&loop=1&background=1`;
				const videoWrapper = $('<div>')
					.addClass('video-wrapper post-image')
					.toggleClass('active', i === 0);

				const $iframe = $('<iframe>')
					.attr('src', vimeoUrl)
					.attr('frameborder', '0')
					.attr('allow', 'autoplay; fullscreen; picture-in-picture')

				const controls = $(`
					<div class="video-controls">
					<p class="play-pause">Play</p>
					<p class="fullscreen-toggle">Full screen</p>
					<input type="range" class="timeline" min="0" max="100" value="0">
					</div>
				`);

				videoWrapper.append(controls);

				const player = new Vimeo.Player($iframe[0]);

				player.on('loaded', function () {
					setTimeout(() => {

						let hideTimeout;
						const videoControls = $('.video-controls');
						const videoWrap = $('.video-wrapper');

						function showControls() {
							videoControls.removeClass('hidden');
							clearTimeout(hideTimeout);
							hideTimeout = setTimeout(() => {
								videoControls.addClass('hidden');
							}, transition * 2);

						}

						videoWrap.on('mousemove', showControls);

						showControls();

					}, transition * 2);

				});

				// ratio
				Promise.all([player.getVideoWidth(), player.getVideoHeight()])
					.then(([w, h]) => {
						const ratio = w / h;
						$iframe[0].style.aspectRatio = ratio;
						controls[0].style.aspectRatio = ratio;
					})
				// PLAY / PAUSE function
				const togglePlayPause = () => {
					player.getPaused().then(paused => {
						if (paused) {
							player.play();
							player.setVolume(1);
							$playPause.text('Pause');
						} else {
							player.pause();
							player.setVolume(0);
							$playPause.text('Play');
						}
					});
				};

				const $playPause = controls.find('.play-pause');
				$playPause.on('click', togglePlayPause);

				// Click en el iframe
				$iframe.on('click', togglePlayPause);

				// Click en el fondo de video-controls (no en sus hijos)
				controls.on('click', function (e) {
					if (e.target === this) {
						togglePlayPause();
					}
				});

				// TIMELINE
				const $timeline = controls.find('.timeline');

				// Actualizar barra de progreso
				player.on('timeupdate', (data) => {
					const progress = (data.seconds / data.duration) * 100;
					$timeline.val(progress);
				});

				// Buscar al mover slider
				$timeline.on('input', (e) => {
					const percent = e.target.value;
					player.getDuration().then(duration => {
						const newTime = (percent / 100) * duration;
						player.setCurrentTime(newTime);
					});
				});

				// fullscreen

				const $fullscreenToggle = controls.find('.fullscreen-toggle');

				$fullscreenToggle.on('click', () => {
					const iframe = $iframe[0];

					if (!document.fullscreenElement) {
						videoWrapper[0].requestFullscreen?.() ||
							videoWrapper[0].webkitRequestFullscreen?.() ||
							videoWrapper[0].msRequestFullscreen?.();
						$fullscreenToggle.text('Exit');
					} else {
						document.exitFullscreen?.() ||
							document.webkitExitFullscreen?.() ||
							document.msExitFullscreen?.();
						$fullscreenToggle.text('Full screen');
					}
				});

				document.addEventListener('fullscreenchange', () => {
					if (!document.fullscreenElement) {
						$fullscreenToggle.text('Full screen');
					} else {
						$fullscreenToggle.text('Exit');
					}
				});

				videoWrapper.append($iframe);
				singleGallery.append(videoWrapper);

			}
		});
	}

	$postContainer.append(singleGallery);

	// loading

	const loading = $('#loading').text('Loading...');

	setTimeout(() => {
		loading.removeClass('hide');
	}, transition);

	// preview

	const preview = $('<a>').attr('id', 'preview').text('Preview');

	if (project.media && project.media.length > 1) {
		$postContainer.append(preview);
	}

	preview.on('click', function () {
		thumbContainer.toggleClass('active');
		preview.toggleClass('active');
	});

	// single thumbnails

	const thumbContainer = $('<div>').attr('id', 'thumbnails');
	if (project.media && project.media.length > 0) {
		project.media.forEach((m, i) => {

			const hasImage = project.media.some(m => m.type === 'image');

			if (m.type === "image") {
				const $thumb = $('<img>')
					.attr('src', m.src)
					.attr('alt', project.fields.title)
					.addClass('thumbnail-item')
					.toggleClass('active', i === 0);
				thumbContainer.append($thumb);
			} else if (m.type === "video" && hasImage) {
				const videoId = m.id;
				const vimeoUrl = `https://player.vimeo.com/video/${videoId}?autoplay=1&muted=1&loop=1&background=1`;
				const videoWrapper = $('<div>')
					.addClass('video-wrapper thumbnail-item')
					.toggleClass('active', i === 0);

				const $iframe = $('<iframe>')
					.attr('src', vimeoUrl)
					.attr('frameborder', '0')
					.attr('allow', 'autoplay; fullscreen; picture-in-picture')

				const player = new Vimeo.Player($iframe[0]);
				Promise.all([player.getVideoWidth(), player.getVideoHeight()])
					.then(([w, h]) => {
						const ratio = w / h;
						$iframe[0].style.aspectRatio = ratio;
					})

				if (m.start !== undefined && m.end !== undefined) {
					const start = Number(m.start);
					const end = Number(m.end);

					player.ready().then(() => {
						player.setCurrentTime(start).then(() => player.play());
					});

					player.on('timeupdate', data => {
						if (data.seconds >= end) {
							player.setCurrentTime(start).then(() => player.play());
						}
					});

					player.on('play', () => {
						$iframe[0].classList.remove('load');
					});

				} else {
					player.ready().then(() => player.play()).catch(() => { });
				}

				videoWrapper.append($iframe);
				thumbContainer.append(videoWrapper);
			}
		});
	}
	$postContainer.append(thumbContainer);

	// prev next

		const currentProjectIndex = window.content.projects.findIndex(p => p.slug === slug);
		const totalProjects = window.content.projects.length;

		const prevIndex = (currentProjectIndex - 1 + totalProjects) % totalProjects;
		const nextIndex = (currentProjectIndex + 1) % totalProjects;

		const prevProject = window.content.projects[prevIndex];
		const nextProject = window.content.projects[nextIndex];

		const prevNextContainer = $('<div>').attr('id', 'prev-next');

		const prevDiv = $('<div>')
			.attr('id', 'prev')
			.html(`<a href="#${prevProject.slug}">${prevProject.fields.title}</a>`);

		const nextDiv = $('<div>')
			.attr('id', 'next')
			.html(`<a href="#${nextProject.slug}">${nextProject.fields.title}</a>`);

		prevNextContainer.append(prevDiv);
		prevNextContainer.append(nextDiv);

		$postContainer.append(prevNextContainer);

		// single index

	const relatedProjects = window.content.projects.filter(p => {
		const categories = p.fields.category;

		return categories.some(cat => cat.trim().toLowerCase() === category.toLowerCase());
	});

	const singleIndex = $('#single-index');

	if (singleIndex.children().length === 0) {
		relatedProjects.forEach(p => {
			const $item = $('<div>');
			const $link = $('<a>')
				.attr('href', `#${p.slug}`)
				.text(p.fields.title);
			$item.append($link);

			singleIndex.append($item);

			setTimeout(() => {
				singleIndex.removeClass('hide');
			}, transition);

		});
	}

	singleIndex.find('a').each(function () {
		const $link = $(this);
		if ($link.attr('href') === `#${slug}`) {
			$link.addClass('active');
		} else {
			$link.removeClass('active');
		}
	});

	const visibleLinks = $('#single-index a');
	const activeIndex = visibleLinks.toArray().findIndex(link => $(link).attr('href') === `#${slug}`);

	centerSingleIndexItem(activeIndex);

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

	const hasImage = project.media.some(m => m.type === 'image');
	const hasVideo = project.media.some(m => m.type === 'video');

	if (!hasImage && hasVideo) {
		creditsButton.addClass('film');
	}

	// add content 

	setTimeout(() => {
		container.removeClass('hide');
		container.append($postContainer);
	}, transition * 2);

	setTimeout(() => {
		$postContainer.removeClass('hide');
		loading.addClass('hide');
	}, transition * 4);

	// functions

	function centerSingleIndexItem(index) {
		const $container = $('#single-index');
		const itemHeight = $container.children().first().outerHeight(true);

		const offset = -index * itemHeight;

		$container.css('transform', `translateY(${offset}px)`);
	}

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
		prevNextContainer.toggleClass('active');
		preview.toggleClass('credits');
		thumbContainer.toggleClass('credits');

		document.documentElement.style.setProperty('--credits-height', `-${creditsHeight}px`);
	});

	$(window).on('scroll', function () {
		const scrollTop = $(window).scrollTop();
		const windowHeight = $(window).height();
		const docHeight = $(document).height();
		const atBottom = (scrollTop + windowHeight) >= (docHeight - 2);

		if (!atBottom) {
			if (creditsContainer.hasClass('active')) {
				creditsButton.trigger('click');
			}
		}
	});
};

$(document).on('mouseenter', '#thumbnails .thumbnail-item', function () {
	const $thumbnails = $('#thumbnails .thumbnail-item');
	const index = $thumbnails.index(this);

	$thumbnails.removeClass('active');
	$(this).addClass('active');

	$('#post .post-image').removeClass('active');
	$('#post .post-image').eq(index).addClass('active');
});

$(document).ready(function () {

	// about

	const aboutButton = $('#about-button');
	const about = $('#about');

	aboutButton.on('click', function (e) {
		e.stopPropagation();
		about.toggleClass('active');
		aboutButton.toggleClass('active');
	});

	about.on('click', function (e) {
		if (e.target === this) {
			about.removeClass('active');
			aboutButton.removeClass('active');
		}
	});

	// press

	const pressButton = $('#press-button');
	const press = $('.content');
	const originalText = $('#press-button').text();

	pressButton.on('click', function () {
		pressButton.toggleClass('active');

		press.children().each(function () {
			const child = $(this)[0];

			if (!$(child).hasClass('active')) {
				const childHeight = child.scrollHeight;
				$(child).css('max-height', childHeight + 'px');
				$(child).addClass('active');
			} else {
				$(child).css('max-height', '');
				$(child).removeClass('active');
			}
		});

		if (pressButton.hasClass('active')) {
			pressButton.text('- View less');
		} else {
			pressButton.text(originalText);
		}
	});

});