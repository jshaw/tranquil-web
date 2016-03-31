/*
 *
 * FuckedUp Interactive Video
 * for the song Year of the Hare
 *
 * Developed by:
 * JSHAW/JSHAW3
 * http://jordanshaw.com / @jshaw3
 *
  */

/*jshint strict: true */

(function () {
    'use strict';
    var global = this;

    // Initial setup
    // =============

    // Map dependancies to local variables
    var _           = global._;
    var $           = global.jQuery;
    var tracking    = global.tracking;
    var _gaq        = global._gaq;

    // Constructor
    // ===========

    var FuckedUp = (global.FuckedUp || (global.FuckedUp = { }));

    var Core = FuckedUp.Core = function (options) {
        var defaults = {};

        this.config         = $.extend(true, defaults, options || { });
        this._initialize();
    };

    // Initialization
    // ==============
    Core.prototype._initialize = function () {
        this._registerInstanceVars();
        this._mobileDetect();
        this._initializePage();
    };

    Core.prototype._mobileDetect = function () {
        var md = new MobileDetect(window.navigator.userAgent);
        var mobile = md.mobile();
        var tablet = md.tablet();

        if (mobile || tablet){
            this.$body.addClass("responsive-page");
        }

        this._isSupportedDevice();

    };

    Core.prototype._isSupportedDevice = function() {
        if(navigator.userAgent.indexOf("Chrome") != -1 ) {
            this.$body.addClass("supported-device");
        }else if(navigator.userAgent.indexOf("Opera") > 0 ){
            this.$body.addClass("non-supported-device");
        }else if(navigator.userAgent.indexOf("Firefox") != -1 ){
            // alert('Firefox');
            // this.$body.addClass("supported-device");
        }

        if(navigator.userAgent.indexOf("Android") > 0 ){
            this.$body.addClass("non-supported-device");
        }

    };

    Core.prototype._registerInstanceVars = function () {
        this.videos = this.config.videos;

        this.$body = $('body');
        this.$video_a = $("#VideoA");
        this.$video_b = $("#VideoB");
        this.$cta = $('.cta-rabbit');

        this.$current_vid = $(".sta-current-vid");
        this.$current_vid_src = $(".sta-current-vid-src");
        this.$next_vid_src = $(".sta-next-vid-src");

        this.$opg = $('.opg');
        this.$btn_landing_play = $('.opg-play');
        this.$landing_background = $('.opg-background');

        this.$video_a_first = _.first(this.$video_a);
        this.$video_b_first = _.first(this.$video_b);

        this.autoplay = false;
        this.current_video = 0;
        this.next_video = 0;
        this.visible_video = 0;

        this.vid_pos;
        this.to_next_vid = false;
        this.hare_fade_to = 1000;
        this.show_hare_time = 3;

        this.is_landing = true;

        this.links = [
            "http://fuckedup.cc/",
            "https://www.youtube.com/watch?v=BiPyCwrbD_g",
            "http://en.wikipedia.org/wiki/Chang%27e",
            "http://www.yelp.com/biz/lafayette-coney-island-detroit",
            "http://www.pokepedia.fr/Pikachu",
            "http://www.sodahead.com/entertainment/if-you-see-a-rabbit-in-a-waistcoat-with-a-pocket-watch-saying-im-late-and-scurry-down-a-rabbit-ho/question-300275/?link=ibaf&q=&imgurl=http%3A%2F%2Fimages.sodahead.com%2Fpolls%2F000300275%2Fpolls_Picture1_4259_937425_poll_xlarge.gif",
            "http://en.wikipedia.org/wiki/March_Hare",
            "https://www.youtube.com/watch?v=SDWypRkRzTk",
            "http://www.amazon.com/A-Wrinkle-Time-Quintet/dp/0312367546",
            "https://www.youtube.com/watch?v=26RTlPgg-tA"
        ];

    };

    Core.prototype._initializePage = function () {
        var classnames  = this.$body.prop('class').split(' ');
        var index       = classnames.length;

        if (index > 1) {
            while(index--) {
                switch (classnames[index]) {
                    case 'home-page':
                        this._initPage();
                        break;
                }
            }
        }
    };

    // INIT MAP GENERAL
    // ================
    Core.prototype._initPage = function(){

        if(location.search.slice(1) === 'landing'){
            this._initLanding();
        } else if(location.search.slice(1) === 'fullscreen'){
            this.$body.addClass('full-screen');
            this.autoplay = true;
        } else if(location.search.slice(1) === 'dev'){
            this.$body.removeClass('full-screen');
            this.$body.removeClass('production');
            this.$video_a.attr('controls', 'true');
            this.$video_b.attr('controls', 'true');
            this.$video_a.attr('muted', 'true');
            this.$video_b.attr('muted', 'true');
            this._initLanding();
        } else {
            this._initLanding();
        }

        this._initApp();
    };

    Core.prototype._initLanding = function(){
        this.$opg.show();
        var handler = _.bind(this._startPlay, this);
        this.$btn_landing_play.on('click', handler);
        this.$landing_background.on('click', handler);

        this._selectRandomStartVideo();

    };

    Core.prototype._selectRandomStartVideo = function() {
        var rdm_st_vdo = _.sample(this.videos);
        this.current_video = rdm_st_vdo;
        var nxt_src = rdm_st_vdo.src;
        this.$video_a.attr('src', nxt_src);
    };

    Core.prototype._startPlay = function(evt) {

        if (this.is_landing === true ){
            this.is_landing = false;
        }

        evt.stopPropagation();
        evt.preventDefault();

        var start_play_fade_handler = _.bind(this._startPlayFadeHandler, this);
        this.$opg.fadeTo( this.hare_fade_to, 0, start_play_fade_handler);
    };

    Core.prototype._startPlayFadeHandler = function() {
        this.$opg.hide();
        this.video_players.a.play();
    };

    Core.prototype._initApp = function(){

        this.video_players = {
            a: Popcorn("#VideoA"),
            b: Popcorn("#VideoB")
        };

        // put hare in random place first load
        this._calculateCTARandomPos();

        // this._initCTA();
        this._initInteractions();
        this._autoPlay();

        // var video_a_time_update_handler = _.bind(this._videoATimeUpdate, this);
        // this.video_players.a.on( "timeupdate", video_a_time_update_handler);

        var video_can_play_all = _.bind(this._videoACanPlayAll, this);
        this.video_players.a.on( "canplayall", video_can_play_all);
    };

    Core.prototype._autoPlay = function() {
        if(this.autoplay === true){
            this.video_players.a.play();
        } else {
            this.video_players.a.pause();
        }
    };

    Core.prototype._videoACanPlayAll = function() {
        var video_a_ended = _.bind(this._videoAEnded, this);
        this.video_players.a.on( "ended", video_a_ended);

        this._swapVideo();

        // playing around with playback rate
        // this.video_players.a.playbackRate(-1);
    };

    Core.prototype._videoAEnded = function() {
        this.$cta.hide();
        this._removeUpsideDown();
        this.video_players.a.playbackRate(1);

        if (this.to_next_vid === false){
            this.video_players.a.play(0.1);
        } else {
            this.$video_a.hide();
            this.video_players.a.volume(0);

            this.$video_b.show();
            this.video_players.b.unmute();
            this.video_players.b.volume(1);
            this.video_players.b.play();

            this.visible_video = 1;
        }
    };

    Core.prototype._videoATimeUpdate = function(v) {
        var ct = Math.round(this.video_players.a.currentTime());
        if (ct === this.videos[this.current_video].duration - this.show_hare_time){
            this.$cta.fadeTo( this.hare_fade_to , 1);
        }
    };

    Core.prototype._initVideoB = function() {
        // var video_b_time_update_handler = _.bind(this._videoBTimeUpdate, this);
        // this.video_players.b.on( "timeupdate", video_b_time_update_handler);

        var video_can_play_all = _.bind(this._videoBCanPlayAll, this);
        this.video_players.b.on( "canplayall", video_can_play_all);
    };

    Core.prototype._videoBCanPlayAll = function() {
        var video_b_ended = _.bind(this._videoBEnded, this);
        this.video_players.b.on( "ended", video_b_ended);

        this._swapVideo();
    };

    Core.prototype._videoBEnded = function() {
        this.$cta.hide();
        this._removeUpsideDown();
        this.video_players.b.playbackRate(1);

        if (this.to_next_vid === false){
            this.video_players.b.play(0.1);
        } else {
            this.$video_b.hide();
            this.video_players.b.volume(0);

            this.$video_a.show();
            this.video_players.a.unmute();
            this.video_players.a.volume(1);
            this.video_players.a.play();

            this.visible_video = 0;
        }
    };

    Core.prototype._videoBTimeUpdate = function(v) {
        var ct = Math.round(this.video_players.b.currentTime());
        if (ct === this.videos[this.current_video].duration - this.show_hare_time){
            this.$cta.fadeTo( this.hare_fade_to , 1);
        }
    };

    Core.prototype._swapVideo = function() {
        var tmp_video = _.sample(this.videos);

        // Not weighted
        // =================
        // var tmp_video_object = this.videos[this.current_video];
        // var tmp_related = _.sample(tmp_video_object);
        // console.log('tmp_related_id',tmp_related);
        // var tmp_related_array = tmp_video_object.related;
        // var tmp_related_array_weight = tmp_video_object.weight;
        // var tmp_related_id = chance.weighted(tmp_related_array, tmp_related_array_weight);
        // var nxt_src = tmp_related.src;

        var nxt_src = tmp_video.src;

        // this.next_video = tmp_related;
        this.next_video = tmp_video;
        this.$next_vid_src.html(nxt_src);
        this._swapVideos(nxt_src);
    };

    Core.prototype._initInteractions = function() {

        if ( this.landing === true ){
            return false;
        }

        this.keymap = this.config.keymap;

        var keyup_handler = _.bind(this._initInteractionsHandler, this);
        this.$body.keyup(keyup_handler);
     };

    Core.prototype._initInteractionsHandler = function(evt){
        this._getRedirectLink();

        if(evt.keyCode === this.keymap.KEYMAP.SPACE*1) {
            _gaq.push(['_trackEvent', 'YOTH', 'Pause', this.current_video.src.substring(this.current_video.src.lastIndexOf("/")+1)]);
            if(this.visible_video === 0) {
                this.video_players.a.pause();
            } else {
                this.video_players.b.pause();
            }
        }

        if(evt.keyCode === this.keymap.KEYMAP.RETURN*1) {
            _gaq.push(['_trackEvent', 'YOTH', 'Play', this.current_video.src.substring(this.current_video.src.lastIndexOf("/")+1)]);
            if (this.is_landing === true ){
                return false;
            }

            if(this.visible_video === 0) {
                this.video_players.a.play();
            } else {
                this.video_players.b.play();
            }
        }

        if(evt.keyCode === this.keymap.KEYCODES.g*1) {
            _gaq.push(['_trackEvent', 'YOTH', 'Go -- first video', this.current_video.src.substring(this.current_video.src.lastIndexOf("/")+1)]);
            if (this.is_landing === true ){
                this.is_landing = false;
            } else {
                return false;
            }

            var start_play_fade_handler = _.bind(this._startPlayFadeHandler, this);
            this.$opg.fadeTo( this.hare_fade_to, 0, start_play_fade_handler);
        }

        if(evt.keyCode === this.keymap.KEYCODES.s*1) {
            _gaq.push(['_trackEvent', 'YOTH', 'Play Back Rate 0.5', this.current_video.src.substring(this.current_video.src.lastIndexOf("/")+1)]);
            if(this.visible_video === 0) {
                this.video_players.a.playbackRate(0.5);
            } else {
                this.video_players.b.playbackRate(0.5);
            }
        }

        if(evt.keyCode === this.keymap.KEYCODES.m*1) {
            _gaq.push(['_trackEvent', 'YOTH', 'Play Back Rate 0.8', this.current_video.src.substring(this.current_video.src.lastIndexOf("/")+1)]);
            if(this.visible_video === 0) {
                this.video_players.a.playbackRate(0.8);
            } else {
                this.video_players.b.playbackRate(0.8);
            }
        }

        if(evt.keyCode === this.keymap.KEYCODES.w*1) {
            _gaq.push(['_trackEvent', 'YOTH', 'Play Back Rate 2', this.current_video.src.substring(this.current_video.src.lastIndexOf("/")+1)]);
            if(this.visible_video === 0) {
                this.video_players.a.playbackRate(2);
            } else {
                this.video_players.b.playbackRate(2);
            }
        }

        if(evt.keyCode === this.keymap.KEYCODES.i*1) {
            _gaq.push(['_trackEvent', 'YOTH', 'Play Back Rate 4', this.current_video.src.substring(this.current_video.src.lastIndexOf("/")+1)]);
            if(this.visible_video === 0) {
                this.video_players.a.playbackRate(4);
            } else {
                this.video_players.b.playbackRate(4);
            }
        }

        if((evt.keyCode === this.keymap.KEYCODES.u*1) ||
            (evt.keyCode === this.keymap.KEYCODES.r*1) ||
            (evt.keyCode === this.keymap.KEYCODES.k*1) ||
            (evt.keyCode === this.keymap.KEYCODES.x*1) ||
            (evt.keyCode === this.keymap.KEYCODES.j*1)) {

            _gaq.push(['_trackEvent', 'YOTH', 'Upsidedown', this.current_video.src.substring(this.current_video.src.lastIndexOf("/")+1)]);

            if(this.visible_video === 0) {
                this.$video_a.addClass('upsidedown');
            } else {
                this.$video_b.addClass('upsidedown');
            }
        }

        if((evt.keyCode === this.keymap.KEYCODES.b*1)) {
            _gaq.push(['_trackEvent', 'YOTH', 'Rightsideup', this.current_video.src.substring(this.current_video.src.lastIndexOf("/")+1)]);

            if(this.visible_video === 0) {
                this.$video_a.removeClass('upsidedown');
            } else {
                this.$video_b.removeClass('upsidedown');
            }
        }

        if(evt.keyCode === this.keymap.KEYCODES.n*1) {
            _gaq.push(['_trackEvent', 'YOTH', 'Next', this.current_video.src.substring(this.current_video.src.lastIndexOf("/")+1)]);

            this.$video_a.removeClass('upsidedown');
            this.$video_b.removeClass('upsidedown');

            this._playNextClip();
        }
    };

    Core.prototype._removeUpsideDown = function() {
        this.$video_a.removeClass('upsidedown');
        this.$video_b.removeClass('upsidedown');
    };

    Core.prototype._initCTA = function() {
        var handler = _.bind(this._playNextClip, this);
        this.$cta.on('click', handler);
    };

    Core.prototype._playNextClip = function() {

        // calculates the random chance or redirecting to an external website
        this._getRedirectLink();

        this.current_video = this.next_video;
        this.$cta.hide();
        this._initVideoB();
        this.to_next_vid = true;

        this._calculateCTARandomPos();

        if(this.visible_video === 0) {
            this.$video_a.hide();
            this.$video_b.show();

            this.video_players.a.volume(0);

            this.video_players.b.play();
            this.video_players.a.pause();

            this.video_players.b.unmute();
            this.video_players.b.volume(1);

            this.visible_video = 1;


        } else {
            this.$video_a.show();
            this.$video_b.hide();

            this.video_players.b.volume(0);

            this.video_players.a.play();
            this.video_players.b.pause();

            this.video_players.a.unmute();
            this.video_players.a.volume(1);

            this.visible_video = 0;
        }

        this.to_next_vid = false;
    };

    Core.prototype._getRedirectLink = function() {
        var activate_redirect_link = chance.bool({likelihood: 0.3});

        if (activate_redirect_link === true){
            var link = _.sample(this.links);
            this.$body.css({'visibility': "hidden"});
            window.location.href = link;
        }
    };

    Core.prototype._calculateCTARandomPos = function() {

        if(this.visible_video === 0) {
            this.vid_pos = this.video_players.a.position();
        } else {
            this.vid_pos = this.video_players.b.position();
        }

        var height = this.vid_pos.height;
        var width = this.vid_pos.width;

        var rand_height = chance.integer({min: 0, max: height-80});
        var rand_width = chance.integer({min: 0, max: width-100});

        this.$cta.css({right: rand_width, bottom: rand_height});
    };


    // Swap Video Template
    Core.prototype._swapVideos = function(nxt_src){
        this.$current_vid_src.html(nxt_src);

        if(this.visible_video === 0) {
            this.$video_b.attr('src', nxt_src);
            this.video_players.b.currentTime(0);
        } else {
            this.video_players.a.currentTime(0);
            this.$video_a.attr('src', nxt_src);
        }
    };

}).call(this);
