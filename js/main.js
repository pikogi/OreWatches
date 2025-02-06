(function($) {
    "use strict";

    // Configuración global
    var cfg = {
        scrollDuration: 800,
        mailChimpURL: 'https://facebook.us8.list-manage.com/subscribe/post?u=cdb7b577e41181934ed6a6a44&id=e6957d85dc'
    };

    var $WIN = $(window);

    // Añadir user agent al HTML para CSS específico
    var doc = document.documentElement;
    doc.setAttribute('data-useragent', navigator.userAgent);

    // Preloader
    var clPreloader = function() {
        $("html").addClass('cl-preload');
        $WIN.on('load', function() {
            $("#loader").fadeOut("slow", function() {
                $("#preloader").delay(300).fadeOut("slow");
            });
            $("html").removeClass('cl-preload');
            $("html").addClass('cl-loaded');
        });
    };

    // Menu en scroll
    var clMenuOnScrolldown = function() {
        var menuTrigger = $('.header-menu-toggle');
        $WIN.on('scroll', function() {
            if ($WIN.scrollTop() > 150) {
                menuTrigger.addClass('opaque');
            } else {
                menuTrigger.removeClass('opaque');
            }
        });
    };

    // Menu Off Canvas
    var clOffCanvas = function() {
        var menuTrigger = $('.header-menu-toggle'),
            nav = $('.header-nav'),
            closeButton = nav.find('.header-nav__close'),
            siteBody = $('body'),
            mainContents = $('section, footer');

        menuTrigger.on('click', function(e) {
            e.preventDefault();
            siteBody.toggleClass('menu-is-open');
        });

        closeButton.on('click', function(e) {
            e.preventDefault();
            menuTrigger.trigger('click');
        });

        siteBody.on('click', function(e) {
            if (!$(e.target).is('.header-nav, .header-nav__content, .header-menu-toggle, .header-menu-toggle span')) {
                siteBody.removeClass('menu-is-open');
            }
        });
    };

    // Photoswipe
    var clPhotoswipe = function() {
        var items = [],
            $pswp = $('.pswp')[0],
            $folioItems = $('.item-folio');

        // Verificar si hay elementos antes de continuar
        if (!$folioItems.length) return;

        $folioItems.each(function(i) {
            var $folio = $(this),
                $thumbLink = $folio.find('.thumb-link'),
                $title = $folio.find('.item-folio__title'),
                $caption = $folio.find('.item-folio__caption'),
                $titleText = '<h4>' + $.trim($title.html() || '') + '</h4>',
                $captionText = $.trim($caption.html() || ''),
                $href = $thumbLink.attr('href') || '',
                $size = ($thumbLink.data('size') || '800x600').split('x'),
                $width = $size[0] || 800,
                $height = $size[1] || 600;

            var item = {
                src: $href,
                w: parseInt($width, 10),
                h: parseInt($height, 10),
                title: $titleText + $captionText
            };

            items.push(item);
        });

        $folioItems.each(function(i) {
            $(this).on('click', function(e) {
                e.preventDefault();
                var options = {
                    index: i,
                    showHideOpacity: true
                }
                var lightBox = new PhotoSwipe($pswp, PhotoSwipeUI_Default, items, options);
                lightBox.init();
            });
        });
    };

    // Stats Counter
    var clStatCount = function() {
        var statSection = $(".about-stats"),
            stats = $(".stats__count");

        statSection.waypoint({
            handler: function(direction) {
                if (direction === "down") {
                    stats.each(function() {
                        var $this = $(this);
                        $({ Counter: 0 }).animate({ Counter: $this.text() }, {
                            duration: 4000,
                            easing: 'swing',
                            step: function(curValue) {
                                $this.text(Math.ceil(curValue));
                            }
                        });
                    });
                }
                this.destroy();
            },
            offset: "90%"
        });
    };

    // Masonry
    var clMasonryFolio = function() {
        var containerBricks = $('.masonry');
        containerBricks.imagesLoaded(function() {
            containerBricks.masonry({
                itemSelector: '.masonry__brick',
                resize: true
            });
        });
    };

    // Slick Slider
    var clSlickSlider = function() {
        $('.clients').slick({
            arrows: false,
            dots: true,
            infinite: true,
            slidesToShow: 6,
            slidesToScroll: 2,
            pauseOnFocus: false,
            autoplaySpeed: 1000,
            responsive: [
                {
                    breakpoint: 1200,
                    settings: { slidesToShow: 5 }
                },
                {
                    breakpoint: 1000,
                    settings: { slidesToShow: 4 }
                },
                {
                    breakpoint: 800,
                    settings: {
                        slidesToShow: 3,
                        slidesToScroll: 2
                    }
                },
                {
                    breakpoint: 500,
                    settings: {
                        slidesToShow: 2,
                        slidesToScroll: 2
                    }
                }
            ]
        });

        $('.testimonials').slick({
            arrows: true,
            dots: false,
            infinite: true,
            slidesToShow: 1,
            slidesToScroll: 1,
            adaptiveHeight: true,
            pauseOnFocus: false,
            autoplaySpeed: 1500,
            responsive: [
                {
                    breakpoint: 900,
                    settings: {
                        slidesToShow: 1,
                        slidesToScroll: 1
                    }
                },
                {
                    breakpoint: 800,
                    settings: {
                        arrows: false,
                        dots: true
                    }
                }
            ]
        });
    };

    // Smooth Scrolling
    var clSmoothScroll = function() {
        $('.smoothscroll').on('click', function(e) {
            var target = this.hash,
                $target = $(target);
            
            e.preventDefault();
            e.stopPropagation();

            $('html, body').stop().animate({
                'scrollTop': $target.offset().top
            }, cfg.scrollDuration, 'swing').promise().done(function() {
                if ($('body').hasClass('menu-is-open')) {
                    $('.header-menu-toggle').trigger('click');
                }
                window.location.hash = target;
            });
        });
    };

    // Placeholder Plugin
    var clPlaceholder = function() {
        $('input, textarea, select').placeholder();
    };

    // Alert Boxes
    var clAlertBoxes = function() {
        $('.alert-box').on('click', '.alert-box__close', function() {
            $(this).parent().fadeOut(500);
        });
    };

    // Contact Form
    var clContactForm = function() {
        $('#contactForm').validate({
            submitHandler: function(form) {
                var sLoader = $('.submit-loader');
                $.ajax({
                    type: "POST",
                    url: "php/mail.php",
                    data: $(form).serialize(),
                    beforeSend: function() {
                        sLoader.slideDown("slow");
                    },
                    success: function(msg) {
                        if (msg == 'OK') {
                            sLoader.slideUp("slow");
                            $('.message-warning').fadeOut();
                            $('#contactForm').fadeOut();
                            $('.message-success').fadeIn();
                        } else {
                            sLoader.slideUp("slow");
                            $('.message-warning').html(msg);
                            $('.message-warning').slideDown("slow");
                        }
                    },
                    error: function() {
                        sLoader.slideUp("slow");
                        $('.message-warning').html("Something went wrong. Please try again.");
                        $('.message-warning').slideDown("slow");
                    }
                });
            }
        });
    };

    // AOS (Animate On Scroll)
    var clAOS = function() {
        AOS.init({
            offset: 200,
            duration: 600,
            easing: 'ease-in-sine',
            delay: 300,
            once: true,
            disable: 'mobile'
        });
    };

    // Mailchimp Form
    var clAjaxChimp = function() {
        $('#mc-form').ajaxChimp({
            language: 'es',
            url: cfg.mailChimpURL
        });

        $.ajaxChimp.translations.es = {
            'submit': 'Enviando...',
            0: '<i class="fa fa-check"></i> Te hemos enviado un email de confirmación',
            1: '<i class="fa fa-warning"></i> Debes ingresar un email válido.',
            2: '<i class="fa fa-warning"></i> El email no es válido.',
            3: '<i class="fa fa-warning"></i> El email no es válido.',
            4: '<i class="fa fa-warning"></i> El email no es válido.',
            5: '<i class="fa fa-warning"></i> El email no es válido.'
        }
    };

    // Back to Top
    var clBackToTop = function() {
        var pxShow = 500,
            fadeInTime = 400,
            fadeOutTime = 400,
            scrollSpeed = 300,
            goTopButton = $(".go-top");

        $(window).on('scroll', function() {
            if ($(window).scrollTop() >= pxShow) {
                goTopButton.fadeIn(fadeInTime);
            } else {
                goTopButton.fadeOut(fadeOutTime);
            }
        });
    };

    // Initialize All Functions
    (function ssInit() {
        clPreloader();
        clMenuOnScrolldown();
        clOffCanvas();
        clPhotoswipe();
        clStatCount();
        clMasonryFolio();
        clSlickSlider();
        clSmoothScroll();
        clPlaceholder();
        clAlertBoxes();
        clContactForm();
        clAOS();
        clAjaxChimp();
        clBackToTop();
    })();

})(jQuery);