(function ($) {
  /*  ==========================================================================
      Grid variables - needed for gridcarousel__init
      ========================================================================== */

  // NOTE: If your updating this make sure to also update the SASS Variables in _variables.scss
  var $grid_sizes = {
    sm: "550",
    md: "700",
    lg: "1000",
    xl: "1200",
    ws: "1400",
    xw: "1600",
  };

  /*  ==========================================================================
      Device Detection - Check if is mobile or ipad
      ========================================================================== */

  var isMobile = false; // initiate as false
  var isTouchDevice = !!("ontouchstart" in window);

  if (
    /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  ) {
    isMobile = true;
  }

  /*  ==========================================================================
      Trigger transition & page load
      ========================================================================== */

  smoothstate__init();
  page__init(); // run main.js
  addBlacklistClass();

  /*  ==========================================================================
      Setup blacklist
      ========================================================================== */

  function addBlacklistClass() {
    $("a").each(function () {
      if (
        this.href.indexOf("/wp-admin/") !== -1 ||
        this.href.indexOf("/wp-login.php") !== -1 ||
        this.href.indexOf(".jpeg") !== -1 ||
        this.href.indexOf(".JPEG") !== -1 ||
        this.href.indexOf(".JPG") !== -1 ||
        this.href.indexOf(".jpg") !== -1
      ) {
        $(this).addClass("wp-link");
      }
    });
  } //addBlacklistClass();

  function smoothstate__init() {
    var current_page_position = $(".wrapper__page__inner").data("position");
    var page_position;

    var options = {
        cacheLength: 2,
        anchors: "a",
        blacklist: ".wp-link, .fancybox-container a, .contact-link, .postmenu__download",
        prefetch: false,
        onStart: {
          // Runs once a page load has been activated
          duration: 450, // Duration of our animation (wrapper__page fade out)
          render: function ($container) {
            // Add class so we know its tranitioning
            $container.addClass("is-transitioning");

            // Destroy current waypoints
            Waypoint.destroyAll();

            // Fade out existing page
            $(".wrapper__page").addClass("wrapper__page--hide");
          },
        },
        onReady: {
          //  Run once the requested content is ready to be injected into the page and the previous animations have finished
          render: function ($container, $newContent) {
            // Get new page content
            $pageContent = $newContent.filter(".wrapper__page");

            // Inject the new page content
            $container.find(".wrapper__page").html($pageContent);

            // Remove additional wrapper__page div
            $(".wrapper__page .wrapper__page").replaceWith(function () {
              return $(".wrapper__page__inner", this);
            });

            // Get new page position
            page_position = $(".wrapper__page__inner").data("position");
            var page_bg = $(".wrapper__page__inner").data("bg");

            // Transition background & sitenav
            // Remove exisiting position classes
            $(".wrapper").removeClass(function (index, className) {
              return (className.match(/(^|\s)wrapper--position-\S+/g) || []).join(" ");
            });
            // Remove exisiting background classes
            $(".wrapper").removeClass(function (index, className) {
              return (className.match(/(^|\s)wrapper--bg-\S+/g) || []).join(" ");
            });
            // Add new position class
            $(".wrapper").addClass("wrapper--" + page_position);
            // Add new backround class
            $(".wrapper").addClass("wrapper--bg-" + page_bg);
          },
        },
        onAfter: function ($container, $newContent) {
          // Fade in new content, add timeout if changing page position
          var timeout_time = 750;
          if (current_page_position === page_position) {
            timeout_time = 0;
          }

          setTimeout(function () {
            $(".wrapper__page").removeClass("wrapper__page--hide");

            // AND Then... remove transitioning class and init the page
            $container.removeClass("is-transitioning");
            addBlacklistClass();
            page__init();
          }, 750);
        },
      },
      smoothState = $("#wrapper").smoothState(options).data("smoothState");
  } // smoothstate__init()

  function page__init() {
    /*  ==========================================================================
    sitenav scroll bar
    ========================================================================== */

    setupProgressBar();

    function setupProgressBar() {
      // When the user scrolls the page, execute updateScrollBar
      window.onscroll = function () {
        updateScrollBar();
      };
    }

    function updateScrollBar() {
      // Get position
      var winScroll = document.body.scrollTop || document.documentElement.scrollTop;
      var height =
        document.documentElement.scrollHeight - document.documentElement.clientHeight;
      var scrolled = (winScroll / height) * 100;

      // Update bar width
      $(".sitenav__item__scrollprogress").css("width", scrolled + "%");
    }

    /*  ==========================================================================
      People pop-up
      ========================================================================== */

    $("body").on("click", ".person__detail__closeoverlay", function () {
      $.fancybox.close();
    });

    $(".person__link").fancybox({
      touch: false,
      autofocus: false,
      baseClass: "fancybox--person",
      beforeShow: function () {
        // Add has with person's name so users can copy the link
        var person_slug = this.src;
        history.replaceState("", document.title, window.location.pathname + person_slug);
      },
      beforeClose: function () {
        // Remove hash
        history.replaceState("", document.title, window.location.pathname);
      },
    });

    // Trigger fancybox on page load
    var hash = window.location.hash.substr(1);
    if (hash) {
      $(".person__link[data-src='#" + hash + "']")
        .fancybox()
        .trigger("click");
    }

    /*  ==========================================================================
      links
      ========================================================================== */

    links__init();

    function links__init($context) {
      $links = $("a").not(".noline, .noline a, .line--added, .btn");

      $links.each(function () {
        var $this = $(this);

        var isAnchorLink = false;
        if ($this.attr("href") && $this.attr("href").indexOf("#anchor") >= 0) {
          isAnchorLink = true;
        }

        // If this is within an link icons container...
        if ($this.closest(".link-icons").length === 1) {
          if ($this.attr("target") === "_blank") {
            // Check if links are external and add a exteranl icon
            $this.prepend("<i class='fal fa-external-link fa--left'></i>");
          } else {
            // if not, add the link icon
            $this.prepend("<i class='fal fa-link fa--left'></i>");
          }
          $this.addClass("link-icons__link");
        }

        // Then add the linklines...
        if ($("img", $this).length < 1) {
          var $icon = $(".fa, .fas, .far, .fal, .fab", $this);
          $this.wrapInner("<span class='linkline'>");
          $this.addClass("line--added");
          if ($icon.length > 0) {
            if ($icon.hasClass("fa--left")) {
              $icon.insertBefore($(".linkline", $this));
            } else {
              $icon.insertAfter($(".linkline", $this));
            }
          }
        }

        if (isAnchorLink) {
          $this.addClass("suplink");
        }
      });
    } // links__init()

    /*  ==========================================================================
      Button hovers
      ========================================================================== */

    btns__init();

    function btns__init($context) {
      $btns = $(".btn");

      $btns.each(function () {
        var $this = $(this);

        // Setup "external" class for external links, to add an icon
        if ($this.attr("target") === "_blank") {
          $this.addClass("btn--external");
        }

        // Wrap text to move above hover animation
        $this.wrapInner("<span class='btn__text'>");

        // On mousemove re-position hover circle
        $this.mousemove(function (e) {
          var parentOffset = $this.offset();
          var relX = e.pageX - parentOffset.left;
          var relY = e.pageY - parentOffset.top;
          $this.css("--x", relX + "px");
          $this.css("--y", relY + "px");
        });
      });
    } // btns__init()

    /*  ==========================================================================
      sharinglinks
      ========================================================================== */

    $(".sharelink--popup").click(function (e) {
      e.preventDefault();
      window.open($(this).attr("href"), "share-dialog", "width=550,height=436");
    });

    /*  ==========================================================================
      accordion
      ========================================================================== */

    $(".accordion__question").click(function () {
      $(this).closest(".accordion__item").toggleClass("accordion__item--open");
    });

    /*  ==========================================================================
      Grid Carousel (Currently used on Featured Posts)
      ========================================================================== */

    var $grid_carousels = $(".row--carousel .owl-carousel");

    if ($grid_carousels.length > 0) {
      gridcarousel__init();
    }

    function gridcarousel__init() {
      $grid_carousels.each(function () {
        var $this = $(this);
        var $this_slidecount = $(".col", $this).length;
        if ($this_slidecount > 1) {
          // create resonsive array from col classes
          var classList = $this.find(".col").attr("class").split(/\s+/);
          var responsive_array = {};
          $.each(classList, function (index, item) {
            // if is col width class
            if (item.indexOf("col-") !== -1) {
              var item_width = 0;
              var items_items = 4;
              item = item.replace("col-", "");
              // get min width from col class
              item_gridsize = item.split("-")[0];
              // check this is a string not a number, this will remove up cols that dont have a grid size e.g. col-1-2
              if (isNaN(item_gridsize)) {
                item = item.replace(item_gridsize + "-", "");
                item_width = $grid_sizes[item_gridsize];
              } else {
                item_width = 0;
              }
              // split rest of class into sections (this should now be something like "1-4")
              item_class_sections = item.split("-");
              // divide second number (e.g 4) by first number (e.g 1) to get number of items
              if (item_class_sections[1]) {
                item_items = item_class_sections[1] / item_class_sections[0];
              } else {
                item_items = 1; // if there isn't a second number it must be a single grid
              }
              responsive_array[item_width] = {
                items: item_items,
              };
            }
          });
          $this.owlCarousel({
            loop: false,
            nav: true,
            dots: false,
            items: 4,
            navText: [
              "<i class='far fa-arrow-left'></i>",
              "<i class='far fa-arrow-right'></i>",
            ],
            responsive: responsive_array,
            startPosition: $this_slidecount,
            autoHeight: true,
          });
        }
      });
    } // gridcarousel__init()

    /*  ==========================================================================
      effects
      ========================================================================== */

    var $effects = $(".effect");

    if ($effects.length > 0) {
      effects__init();
    }

    function effects__init() {
      $effects.each(function () {
        var $el = $(this);
        $el.waypoint({
          handler: function (direction) {
            if (direction === "down") {
              $el.addClass("effect--ready");
            } else {
              $el.removeClass("effect--ready");
            }
          },
          offset: "90%",
        });
      });
    } // effects__init()

    /*  ==========================================================================
      AJAX load more / paging
      ========================================================================== */

    $(".paging__loadmore").click(function () {
      var button = $(this);
      var current_page = button.data("currentpage");
      var max_pages = button.data("maxpages");
      var ajax_url = button.data("ajaxurl");
      var posts = button.data("posts");
      var data = {
        action: "loadmore",
        query: posts, // that's how we get params from wp_localize_script() function
        page: current_page,
      };
      var button_text; // create variable to store button text

      // This AJAX triggers a PHP hook within function-hooks.php called ajax_loadmore_handler
      $.ajax({
        url: ajax_url, // AJAX handler
        data: data,
        type: "POST",
        beforeSend: function (xhr) {
          button_text = button.html(); // store current button text
          button.addClass("btn--loading");
          button.find(".btn__text").text("Loading..."); // change the button text, to let the user know we are loading more posts
        },
        success: function (data) {
          if (data) {
            button.html(button_text); // set back to previous button text
            button.removeClass("btn--loading");
            $(".loadmore-container").append(data); // insert new posts to the loadmore-container, this should be the row that includes the posts
            current_page++;
            // if last page, remove the button..
            if (parseInt(current_page) === parseInt(max_pages)) {
              button.remove();
            }
            // Re-init links to make sure linklines on newly loaded content still work
            links__init();
          } else {
            button.remove(); // if no data, remove the button as well
          }
        },
      });
    });

    /*  ==========================================================================
      NAVIGATION - mobnav
      ========================================================================== */

    var $mobnav = $(".mobnav");
    var $siteheaderbd = $(".siteheader__bd");
    var $mobnavtoggle = $(".mobnav-toggle");
    var mobnavopenclass = "mobnavopen";

    mobnav__init();

    function mobnav__init() {
      // Close on initial load
      $mobnav.height(0);
      $("body").removeClass(mobnavopenclass);

      // Open mobnav on click the toggle
      $mobnavtoggle.on("click touchend", function (e) {
        e.preventDefault();
        if (!$("body").hasClass(mobnavopenclass)) {
          // IT'S NOT OPEN...
          $mobnav_height = window.innerHeight - $siteheaderbd.outerHeight(false);
          $mobnav.height($mobnav_height);
          $("body").addClass(mobnavopenclass);
        } else {
          // IT'S OPEN...
          $mobnav.height(0);
          $("body").removeClass(mobnavopenclass);
        }
      });

      // On click mobnav, close the nav
      $mobnav.find(".mobnav__section a").click(function () {
        $mobnav.height(0);
        $("body").removeClass(mobnavopenclass);
      });

      $(window).resize(mobnav__resize);
    } // mobnav__init()

    // On resize check mobnav height is still right
    function mobnav__resize() {
      if ($("body").hasClass(mobnavopenclass)) {
        $mobnav_height = window.innerHeight - $siteheaderbd.outerHeight(false);
        $mobnav.height($mobnav_height);
      }
    } // mobnav__resize()

    /*  ==========================================================================
    Disable page transitions on resize
    ========================================================================== */

    (function () {
      var classes = document.body.classList;
      var timer = 0;
      window.addEventListener("resize", function () {
        if (timer) {
          clearTimeout(timer);
          timer = null;
        } else {
          classes.add("stop-transitions");
        }

        timer = setTimeout(function () {
          classes.remove("stop-transitions");
          timer = null;
        }, 100);
      });
    })();

    /*  ==========================================================================
    Text animations
    ========================================================================== */

    // Text Reveal (slide up)

    if ($(".text-reveal").length > 0) {
      textreveal__init();
    }

    function textreveal__init() {
      $(".text-reveal")
        .not(".text-reveal--ready")
        .each(function () {
          if ($(this).hasClass("text-reveal--chars")) {
            $(this).lettering("words");
            $(this).find("span").lettering();
          } else {
            $(this).lettering("words");
            $(this).find("span").lettering("words");
          }
          var $el = $(this);
          $el.waypoint({
            handler: function (direction) {
              if (direction === "down") {
                $el.addClass("text-reveal--ready");
              } else {
                $el.removeClass("text-reveal--ready");
              }
            },
            offset: "95%",
          });
        });
    }

    // Text Fade
    if ($(".text-fade").length > 0) {
      textfade__init();
    }

    function textfade__init() {
      $(".text-fade")
        .not(".text-fade--ready")
        .each(function () {
          $(this).lettering();
          var $el = $(this);
          $el.waypoint({
            handler: function (direction) {
              if (direction === "down") {
                $el.addClass("text-fade--ready");
              } else {
                $el.removeClass("text-fade--ready");
              }
            },
            offset: "100%",
          });
        });
    }

    // Text Scroll (infinite scroll)

    var default_animation_speed = 5;

    var el_class = "text-scroll";
    var inner_class = "text-scroll__wrap";

    $("." + el_class).each(function () {
      textscroll__init($(this));
    });

    $(window).resize(function () {
      $("." + el_class).each(function () {
        textscroll__resize($(this));
      });
    });

    function textscroll__init($el) {
      // Setup two scroll wraps (duplicate the HTML)
      $el.wrapInner("<div class='" + inner_class + "'></div>");
      $el
        .find("." + inner_class)
        .clone()
        .appendTo($el);
      $el
        .find("." + inner_class + ":first-child()")
        .clone()
        .appendTo($el);

      // Setup animation times
      textscroll__resize($el);

      // Once everything is set up, add "loaded" class
      $el.addClass(el_class + "--loaded");
    }

    function textscroll__resize($el) {
      // Check if element has custom speed or default
      var animation_speed = default_animation_speed;
      if ($el.data("speed")) {
        animation_speed = $el.data("speed");
      } else {
        animation_speed = default_animation_speed;
      }

      // Set animation time
      var linelength = $("." + inner_class, $el).width();
      var distance = linelength;
      var speed = animation_speed * 0.01;
      var duration = distance / speed;
      var delay = 0 - duration / 3;

      $el.find("." + inner_class).css("animation-duration", duration + "ms");
      $el.find("." + inner_class + ":first-child()").css("animation-delay", delay + "ms");
      $el
        .find("." + inner_class + ":nth-child(2)")
        .css("animation-delay", delay * 2 + "ms");
    }

    /*  ==========================================================================
    Footer dots animation
    ========================================================================== */

    var dots_default_animation_speed = 1;

    var dots_el_class = "dotsanim__dotsrow";
    var dots_inner_class = "dotsanim__dotswrap";

    $("." + dots_el_class).each(function () {
      dotsanim__init($(this));
    });

    function dotsanim__init($el) {
      // Check if element has custom speed or default
      var animation_speed = dots_default_animation_speed;
      if ($el.data("speed")) {
        animation_speed = $el.data("speed");
      } else {
        animation_speed = dots_default_animation_speed;
      }

      // Setup two scroll wraps (duplicate the HTML)
      $el.wrapInner("<div class='" + dots_inner_class + "'></div>");
      $el
        .find("." + dots_inner_class)
        .clone()
        .appendTo($el);
      $el
        .find("." + dots_inner_class + ":first-child()")
        .clone()
        .appendTo($el);

      // Set animation time
      var linelength = $("." + dots_inner_class, $el).width();
      var distance = linelength;
      var speed = animation_speed * 0.01;
      var duration = distance / speed;
      var delay = 0 - duration / 3;

      $el.find("." + dots_inner_class).css("animation-duration", duration + "ms");
      $el
        .find("." + dots_inner_class + ":first-child()")
        .css("animation-delay", delay + "ms");
      $el
        .find("." + dots_inner_class + ":nth-child(2)")
        .css("animation-delay", delay * 2 + "ms");

      // Once everything is set up, add "loaded" class
      $el.addClass(dots_el_class + "--loaded");
    }

    /*  ==========================================================================
    Check when postmenu is sticky
    ========================================================================== */

    if ($(".postmenu").length) {
      var postmenu_position = $(".postmenu").offset().top;
      $(window).resize(function () {
        if ($(".postmenu").length) {
          postmenu_position = $(".postmenu").offset().top;
        }
      });
      $(window).scroll(function () {
        if ($(window).scrollTop() >= postmenu_position) {
          // Your div has reached the top
          $(".postmenu").addClass("postmenu--pinned");
        } else {
          $(".postmenu").removeClass("postmenu--pinned");
        }
      });
    }

    /*  ==========================================================================
      Initiate plyr (custom video controls)
      ========================================================================== */

    plyrs__init();

    function plyrs__init($context) {
      $plyrs = $(".mediavideo");

      $plyrs.each(function () {
        new Plyr(this, {
          controls: ["play", "progress"],
          hideControls: false,
          tooltips: { controls: false, seek: false },
        });
      });
    } // plyrs__init()

    /*  ==========================================================================
			Homepage Header scroll
			========================================================================== */

    if ($(".pageheader--page--home .pageheader__bg").length) {
      var controller = new ScrollMagic.Controller();

      var bg_tween = TweenMax.fromTo(
        $(".pageheader--page--home .pageheader__bg"),
        0.5,
        {
          opacity: 1,
        },
        {
          opacity: 0,
        }
      );

      var title_scroll = new ScrollMagic.Scene({
        offset: 0,
        duration: "70%",
      })
        .setTween(bg_tween)
        .addTo(controller);
    }
  } // page__init();
})(jQuery); // Domready
