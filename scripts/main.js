// content

$(document).ready(function () {

	if (!window.content || !window.content.projects) return;
	const c = window.content;

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

	const $carousel = $('#archive');
	$carousel.empty();

	function handleResponsive() {
		const isMobile = window.innerWidth <= 768;

		$carousel.empty();

		if (isMobile) {

			// mobile

			c.projects.forEach((project, index) => {
				const category = project.fields.category.toLowerCase();

				const $slide = $('<div>')
					.addClass('thumbnail')
					.attr('data-index', index)
					.attr('data-category', category);

				if (project.media && project.media.length > 0) {
					const firstMedia = project.media[0];

					let $media;

					if (firstMedia.type === "image") {
						$media = $('<img>').attr('src', firstMedia.src);
						$slide.append($media);
					} else if (firstMedia.type === "video") {
						const videoId = firstMedia.id;
						const vimeoUrl = `https://player.vimeo.com/video/${videoId}?autoplay=1&muted=1&loop=1&background=1`;

						// 1️⃣ Crear el img vacío y añadirlo inmediatamente
						const $thumbImg = $('<img>')
							.addClass('vimeo-thumb')

						$slide.append($thumbImg);

						// 2️⃣ fetch para cargar la URL real
						fetch(`https://vimeo.com/api/v2/video/${videoId}.json`)
							.then(res => res.json())
							.then(data => {
								const thumb = data[0].thumbnail_large;
								const w = data[0].thumbnail_width;
								const h = data[0].thumbnail_height;
								$thumbImg.attr('src', thumb).addClass('vimeo-thumb').attr('style', `aspect-ratio: ${w} / ${h};`);
								player.on('play', () => {
									$thumbImg.css('opacity', 0);
								});

								const durationSeconds = data[0].duration;
								const minutes = Math.floor(durationSeconds / 60);
								const seconds = durationSeconds % 60;
								const formattedDuration = `${minutes}:${seconds.toString().padStart(2, '0')}`;
								console.log(formattedDuration);

								project.fields.duration = formattedDuration;

								const $durationField = $(`.thumbnail[data-index="${index}"] .list-item span:last-child`);
								if ($durationField.length) {
									$durationField.text(formattedDuration);
								}
							});

						const $iframe = $('<iframe>')
							.attr('src', vimeoUrl)
							.attr('frameborder', '0')
							.attr('allow', 'autoplay; fullscreen; picture-in-picture')
							.attr('allowfullscreen', true)

						const player = new Vimeo.Player($iframe[0]);

						Promise.all([player.getVideoWidth(), player.getVideoHeight()])
							.then(([w, h]) => {
								const ratio = w / h;
								$iframe[0].style.aspectRatio = ratio;
							});

						if (firstMedia.start !== undefined && firstMedia.end !== undefined) {
							const start = Number(firstMedia.start);
							const end = Number(firstMedia.end);

							player.ready().then(() => {
								player.setCurrentTime(start).then(() => player.play())
							});

							player.on('timeupdate', data => {

								if (data.seconds >= end) {

									player.setCurrentTime(start).then(() => {
										player.play();
									});
								}
							});

						} else {
							player.ready().then(() => player.play()).catch(() => { });
						}

						$slide.append($iframe);
					}
				}

				// info

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

			// desktop

			c.projects.forEach((project, index) => {
				const category = project.fields.category.toLowerCase();

				const $slide = $('<div>')
					.addClass('thumbnail')
					.attr('data-index', index)
					.attr('data-category', category);

				if (project.media && project.media.length > 0) {
					const firstMedia = project.media[0];
					let $media;

					if (firstMedia.type === "image") {
						$media = $('<img>').attr('src', firstMedia.src);
						$slide.append($media);
					} else if (firstMedia.type === "video") {
						const videoId = firstMedia.id;
						const vimeoUrl = `https://player.vimeo.com/video/${videoId}?autoplay=1&muted=1&loop=1&background=1`;

						fetch(`https://vimeo.com/api/v2/video/${videoId}.json`)
							.then(res => res.json())
							.then(data => {
								const thumb = data[0].thumbnail_large;
								const $thumbImg = $('<img>').attr('src', thumb).addClass('vimeo-thumb');
								$slide.append($thumbImg);
								player.on('play', () => {
									$thumbImg.css('opacity', 0);
								});

								const durationSeconds = data[0].duration;
								const minutes = Math.floor(durationSeconds / 60);
								const seconds = durationSeconds % 60;
								const formattedDuration = `${minutes}:${seconds.toString().padStart(2, '0')}`;
								console.log(formattedDuration);

								project.fields.duration = formattedDuration;

								const $durationField = $(`#list .list-item[data-index="${index}"] span:last-child`);
								if ($durationField.length) {
									$durationField.text(formattedDuration);
								}

							})

						const $iframe = $('<iframe>')
							.attr('src', vimeoUrl)
							.attr('frameborder', '0')
							.attr('allow', 'autoplay; fullscreen; picture-in-picture')
							.attr('allowfullscreen', true)

						const player = new Vimeo.Player($iframe[0]);

						Promise.all([player.getVideoWidth(), player.getVideoHeight()])
							.then(([w, h]) => {
								const ratio = w / h;
								$iframe[0].style.aspectRatio = ratio;
							});

						if (firstMedia.start !== undefined && firstMedia.end !== undefined) {
							const start = Number(firstMedia.start);
							const end = Number(firstMedia.end);

							player.ready().then(() => {
								player.setCurrentTime(start).then(() => player.play())
							});

							player.on('timeupdate', data => {

								if (data.seconds >= end) {

									player.setCurrentTime(start).then(() => {
										player.play();
									});
								}
							});

						} else {
							player.ready().then(() => player.play()).catch(() => { });
						}

						$slide.append($iframe);
					}
				}

				if (project.fields.category) {
					const categoryClass = project.fields.category.toLowerCase().replace(/\s+/g, '-');
					$slide.addClass(categoryClass);
				}

				$carousel.append($slide);

			});

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

// img sizes

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

// list

let lastMousePos = { x: 0, y: 0 };
let isMoving = false;
let hoverTimer = null;
const stopThreshold = 2;
const stopDelay = 50;

let scrollLock = false;

$(document).on('mousemove', function (e) {
	const dx = Math.abs(e.pageX - lastMousePos.x);
	const dy = Math.abs(e.pageY - lastMousePos.y);

	lastMousePos.x = e.pageX;
	lastMousePos.y = e.pageY;

	if (dx > stopThreshold || dy > stopThreshold) {
		isMoving = true;
		clearTimeout(hoverTimer);
	}

	hoverTimer = setTimeout(() => {
		isMoving = false;

		const $target = $(e.target).closest('.list-item');
		if ($target.length) {
			const index = $target.data('index');

			if (scrollLock) {
				scrollLock = false;
			} else {
				setActive(index);
				centerSlide(index);
				console.log('bbb');
				console.log(scrollLock);
			}
		}
	}, stopDelay);
});

function checkActivePostOnScroll() {
	const $container = $('#gallery-container');
	const containerScroll = $container.scrollTop();
	const containerHeight = $container.height();
	const scrollBottom = containerScroll + containerHeight;
	const scrollHeight = $container[0].scrollHeight;

	const $thumbnails = $('#archive .thumbnail');
	let activeIndex = null;

	if (containerScroll <= 0) {
		activeIndex = $thumbnails.first().data('index');
	} else if (scrollBottom >= scrollHeight - 2) {
		activeIndex = $thumbnails.last().data('index');
	} else {
		$thumbnails.each(function () {
			const $thumb = $(this);
			const thumbTop = $thumb.position().top + containerScroll;

			if (thumbTop <= containerScroll + containerHeight / 2) {
				activeIndex = $thumb.data('index');
			}
		});
	}

	if (activeIndex !== null) {
		setActive(activeIndex);
	}

	scrollLock = true;
}

$('#gallery-container').on('scroll', function () {
	checkActivePostOnScroll();
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
		$container.stop().animate({ scrollTop: scrollTo }, 1000, 'easeOutQuad');
	}
}

// category filter

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
$(document).on('click', '.list-item, #archive .thumbnail a, #single-index a', function(e) {
    e.preventDefault();
    const slug = $(this).attr('href').substring(1);

    history.pushState({ slug }, '', `#${slug}`);
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

// single

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
			} else if (m.type === "video") {
				const videoId = m.id;
				const vimeoUrl = `https://player.vimeo.com/video/${videoId}?autoplay=1&muted=1&loop=1&background=1`;
				const videoWrapper = $('<div>')
				.addClass('video-wrapper post-image')
				.toggleClass('active', i === 0);
				
				fetch(`https://vimeo.com/api/v2/video/${videoId}.json`)
					.then(res => res.json())
					.then(data => {
						const thumb = data[0].thumbnail_large;
						const $thumbImg = $('<img>').attr('src', thumb).addClass('vimeo-thumb');
						videoWrapper.append($thumbImg);
						player.on('play', () => {
							$thumbImg.css('opacity', 0);
						});

					})

				const $iframe = $('<iframe>')
					.attr('src', vimeoUrl)
					.attr('frameborder', '0')
					.attr('allow', 'autoplay; fullscreen; picture-in-picture')
					.attr('allowfullscreen', true)

				// Crear controles
				const controls = $(`
					<div class="video-controls">
					<p class="play-pause">Pause</p>
					<p class="mute-toggle">Sound</p>
					<p class="fullscreen-toggle">Full screen</p>
					<input type="range" class="timeline" min="0" max="100" value="0">
					</div>
				`);

				videoWrapper.append(controls);

				const player = new Vimeo.Player($iframe[0]);
				// ratio
				Promise.all([player.getVideoWidth(), player.getVideoHeight()])
					.then(([w, h]) => {
						const ratio = w / h;
						$iframe[0].style.aspectRatio = ratio;
					})
				// PLAY / PAUSE
				const $playPause = controls.find('.play-pause');
				$playPause.on('click', () => {
					player.getPaused().then(paused => {
						if (paused) {
							player.play();
							$playPause.text('Pause');
						} else {
							player.pause();
							$playPause.text('Play');
						}
					});
				});

				// MUTE / SOUND
				const $muteToggle = controls.find('.mute-toggle');
				let isMuted = true;
				$muteToggle.on('click', () => {
					if (isMuted) {
						player.setVolume(1);
						$muteToggle.text('Mute');
					} else {
						player.setVolume(0);
						$muteToggle.text('Sound');
					}
					isMuted = !isMuted;
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

				// FULLSCREEN
				const $fullscreenToggle = controls.find('.fullscreen-toggle');

				$fullscreenToggle.on('click', () => {
					const iframe = $iframe[0];

					// El iframe está dentro de videoWrapper, lo ponemos en fullscreen
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

				// Cambiar texto cuando cambia el estado de fullscreen
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

	// single thumbnails

	const thumbContainer = $('<div>').attr('id', 'thumbnails');
	if (project.media && project.media.length > 0) {
		project.media.forEach((m, i) => {
			if (m.type === 'image') {
				const $thumb = $('<img>')
					.attr('src', m.src)
					.attr('alt', project.fields.title)
					.addClass('thumbnail-item')
					.toggleClass('active', i === 0);
				thumbContainer.append($thumb);
			} else if (m.type === "video") {
				const videoId = m.id;
				const vimeoUrl = `https://player.vimeo.com/video/${videoId}?autoplay=1&muted=1&loop=1&background=1`;
				const videoWrapper = $('<div>')
				.addClass('video-wrapper thumbnail-item')
				.toggleClass('active', i === 0);

				fetch(`https://vimeo.com/api/v2/video/${videoId}.json`)
					.then(res => res.json())
					.then(data => {
						const thumb = data[0].thumbnail_large;
						const $thumbImg = $('<img>').attr('src', thumb).addClass('vimeo-thumb');
						videoWrapper.append($thumbImg);
						player.on('play', () => {
							$thumbImg.css('opacity', 0);
						});

					})

				const $iframe = $('<iframe>')
					.attr('src', vimeoUrl)
					.attr('frameborder', '0')
					.attr('allow', 'autoplay; fullscreen; picture-in-picture')
					.attr('allowfullscreen', true)

				const player = new Vimeo.Player($iframe[0]);
				Promise.all([player.getVideoWidth(), player.getVideoHeight()])
					.then(([w, h]) => {
						const ratio = w / h;
						$iframe[0].style.aspectRatio = ratio;
					})

				videoWrapper.append($iframe);
				thumbContainer.append(videoWrapper);
			}
		});
	}
	$postContainer.append(thumbContainer);

	// Single index
	const relatedProjects = window.content.projects.filter(p => p.fields.category.toLowerCase() === category);
	const singleIndex = $('#single-index');
	singleIndex.empty();
	relatedProjects.forEach(p => {
		const $item = $('<div>');
		const $link = $('<a>').attr('href', `#${p.slug}`).text(p.fields.title);
		if (p.slug === slug) $link.addClass('active');
		$item.append($link);
		singleIndex.append($item);
	});

	// Centrar el item activo usando transform
	const activeIndex = relatedProjects.findIndex(p => p.slug === slug);
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

	container.append($postContainer);

	const creditsHeight = creditsContainer.outerHeight();

	console.log(creditsHeight);

	// functions

	// hide controls
	let hideTimeout;
	const videoControls = $('.video-controls');
	const videoWrap = $('.video-wrapper');

	function showControls() {
		console.log('hola');
		videoControls.removeClass('hidden');
		clearTimeout(hideTimeout);
		hideTimeout = setTimeout(() => {
			videoControls.addClass('hidden');
		}, 1500);

		console.log(videoWrap.height());
	}

	videoWrap.on('mousemove', showControls);

	// showControls();

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

		document.documentElement.style.setProperty('--credits-height', `-${creditsHeight}px`);
	});
};

// about

$(document).ready(function () {
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
});