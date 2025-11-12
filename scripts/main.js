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

	// load

	function handleResponsive() {
		const isMobile = window.innerWidth <= 768;

		const $carousel = $('#archive');
		$carousel.empty();

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

						// Imagen temporal
						const $thumbImg = $('<img>').addClass('vimeo-thumb');
						$slide.append($thumbImg);

						fetch(`https://vimeo.com/api/v2/video/${videoId}.json`)
							.then(res => res.json())
							.then(data => {
								const thumb = data[0].thumbnail_large;
								const w = data[0].thumbnail_width;
								const h = data[0].thumbnail_height;
								$thumbImg.attr('src', thumb).css('aspect-ratio', `${w} / ${h}`);

								player.on('play', () => {
									$thumbImg.css('opacity', 0);
								});

								setHeight();

								const durationSeconds = data[0].duration;
								const minutes = Math.floor(durationSeconds / 60);
								const seconds = durationSeconds % 60;
								const formattedDuration = `${minutes}:${seconds.toString().padStart(2, '0')}`;
								project.fields.duration = formattedDuration;

								const $durationField = $(`.thumbnail[data-index="${index}"] .post-data span:last-child`);
								if ($durationField.length) $durationField.text(formattedDuration);
							});

						const $iframe = $('<iframe>')
							.attr('src', vimeoUrl)
							.attr('frameborder', '0')
							.attr('allow', 'autoplay; fullscreen; picture-in-picture')
							.attr('allowfullscreen', true);

						const player = new Vimeo.Player($iframe[0]);

						Promise.all([player.getVideoWidth(), player.getVideoHeight()])
							.then(([w, h]) => {
								const ratio = w / h;
								$iframe[0].style.aspectRatio = ratio;
								// setHeight();
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

		} else {

			// desktop

			c.projects.forEach((project, index) => {
				const categories = project.fields.category;

				const $slide = $('<div>')
					.addClass('thumbnail')
					.attr('data-index', index)

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

						const $durationField = $(`#list .list-item[data-index="${index}"] span:last-child`);
						if ($durationField.length) $durationField.text(text);

					} else if (firstMedia.type === "video") {
						const videoId = firstMedia.id;
						const vimeoUrl = `https://player.vimeo.com/video/${videoId}?autoplay=1&muted=1&loop=1&background=1`;

						fetch(`https://vimeo.com/api/v2/video/${videoId}.json`)
							.then(res => res.json())
							.then(data => {
								const thumb = data[0].thumbnail_large;
								const $thumbImg = $('<img>').attr('src', thumb).addClass('vimeo-thumb');
								$slide.append($thumbImg);
								player.on('play', () => $thumbImg.css('opacity', 0));

								const durationSeconds = data[0].duration;
								const minutes = Math.floor(durationSeconds / 60);
								const seconds = durationSeconds % 60;
								const formattedDuration = `${minutes}:${seconds.toString().padStart(2, '0')}`;

								const imageCount = project.media.filter(m => m.type === "image").length;
								const imageText = imageCount > 0 ? `/${imageCount} img` : "";

								const finalText = `${formattedDuration}${imageText}`;
								project.fields.duration = finalText;

								const $durationField = $(`#list .list-item[data-index="${index}"] span:last-child`);
								if ($durationField.length) $durationField.text(finalText);

								setHeight();
							});

						const $iframe = $('<iframe>')
							.attr('src', vimeoUrl)
							.attr('frameborder', '0')
							.attr('allow', 'autoplay; fullscreen; picture-in-picture')
							.attr('allowfullscreen', true);

						const player = new Vimeo.Player($iframe[0]);

						Promise.all([player.getVideoWidth(), player.getVideoHeight()])
							.then(([w, h]) => {
								const ratio = w / h;
								$iframe[0].style.aspectRatio = ratio;
								// setHeight();
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
					// .attr('data-category', categories.join(',').toLowerCase());

					categories.forEach(cat => {
						const categoryClass = cat.trim().toLowerCase().replace(/\s+/g, '-');
						$fields.addClass(categoryClass);
					});

					$fields.append($('<span>').addClass('index').text(`${index + 1}.`));

					Object.entries(project.fields).forEach(([key, value]) => {
						if (Array.isArray(value)) {
							$fields.append($('<span>').text(value.join('/')));
						} else {
							$fields.append($('<span>').text(value));
						}
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
				}, 500);
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
				}, 500);
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
let isMoving = false;
let hoverTimer = null;
const stopThreshold = 1;
const stopDelay = 30;

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
				// console.log(scrollLock);
			}
		}
	}, stopDelay);
});

function checkActivePostOnScroll() {
	const isMobile = window.innerWidth <= 768;
	const $container = isMobile ? $(window) : $('#gallery-container');
	const containerScroll = $container.scrollTop();
	const containerHeight = isMobile ? window.innerHeight : $container.height();
	const scrollBottom = containerScroll + containerHeight;
	const scrollHeight = isMobile ? $(document).height() : $container[0].scrollHeight;

	const $thumbnails = $('#archive .thumbnail');
	let activeIndex = null;

	if (containerScroll <= 0) {
		activeIndex = $thumbnails.first().data('index');
	} else if (scrollBottom >= scrollHeight - 2) {
		activeIndex = $thumbnails.last().data('index');
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

	scrollLock = true;
}

$('#gallery-container').on('scroll', function () {
	if (window.innerWidth > 768) checkActivePostOnScroll();
});

$(window).on('scroll', function () {
	if (window.innerWidth <= 768) checkActivePostOnScroll();
});

function setActive(index) {
	var items = $('.list-item, .post-data');
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

// $(document).ready(function () {

// 	const container = $('#gallery-container');

// 	const filmButton = $('#film-button');
// 	const photoButton = $('#photo-button');

// 	const postPhoto = $('.photo');
// 	const postFilm = $('.film');

// 	filmButton.on('click', function () {
// 		if (container.hasClass('single-view')) {
// 			container.removeClass('single-view');
// 			container.children().addClass('hide');
// 			$('#single-index').addClass('hide');
// 			$('#loading').addClass('hide');
// 			setTimeout(() => {
// 				container.empty();
// 				$('#single-index').empty();
// 				$('#loading').empty();
// 			}, 1000);
// 		} else {
// 			$(this).toggleClass('active');
// 			$(this).siblings().removeClass('active');
// 			postPhoto.toggleClass('filter');
// 			postFilm.removeClass('filter');
// 		}
// 	});

// 	photoButton.on('click', function () {
// 		if (container.hasClass('single-view')) {
// 			container.removeClass('single-view');
// 			container.children().addClass('hide');
// 			$('#single-index').addClass('hide');
// 			$('#loading').addClass('hide');
// 			setTimeout(() => {
// 				container.empty();
// 				$('#single-index').empty();
// 				$('#loading').empty();
// 			}, 1000);
// 		} else {
// 			$(this).toggleClass('active');
// 			$(this).siblings().removeClass('active');
// 			postFilm.toggleClass('filter');
// 			postPhoto.removeClass('filter');
// 		}

// 	});

// });

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
	// const listItem = $('.list-item');
	// const thumbnails = $('.thumbnail');
	const transition = 1000;

	$('nav>*').removeClass('active');

	if (!project) return;

	// listItem.addClass('filter');
	// thumbnails.addClass('filter');
	container.children().addClass('hide');

	setTimeout(() => {
		container.empty();
	}, transition);

	container.addClass('single-view');

	// $('#list').empty();

	// const category = project.fields.category.toLowerCase();

	const categories = Array.isArray(project.fields.category)
		? project.fields.category
		: [project.fields.category || ''];
	const category = categories[0].trim().toLowerCase();

	const $postContainer = $('<div>').attr('id', 'post').addClass('hide');

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
							$playPause.text('Pause');
						} else {
							player.pause();
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

	// loading

	const loading = $('#loading').text('Loading...');

	setTimeout(() => {
		loading.removeClass('hide');
	}, transition);

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

	// add content 

	setTimeout(() => {
		container.removeClass('hide');
		container.append($postContainer);
	}, transition * 2);

	setTimeout(() => {
		$postContainer.removeClass('hide');
	}, transition * 4);

	const creditsHeight = creditsContainer.outerHeight();

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

		if (window.innerWidth <= 768) {

		}

		singleGallery.toggleClass('credits');
		singleIndex.toggleClass('credits');

		creditsContainer.toggleClass('active');

		document.documentElement.style.setProperty('--credits-height', `${creditsHeight}px`);
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
	const press = $('#press .content');

	pressButton.on('click', function (e) {
		press.toggleClass('active');
		pressButton.toggleClass('active');

		if (press.hasClass('active')) {
			let totalHeight = 0;
			press.children().each(function () {
				totalHeight += $(this).outerHeight(true);
			});

			press.css('max-height', totalHeight + 'px');
			pressButton.text('- View less');
		} else {
			press.css('max-height', '');
			pressButton.text('+ View all');
		}
	});

});