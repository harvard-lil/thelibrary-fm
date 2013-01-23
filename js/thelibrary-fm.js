// The bulk of the following is from http://www.schillmania.com/projects/soundmanager2/

soundManager.url = 'swf/';
soundManager.flashVersion = 8;
soundManager.useFlashBlock = false;
soundManager.useHighPerformance = true;
soundManager.wmode = 'transparent';
soundManager.useFastPolling = true;

$(function(){

    // Load the control box slowly
    $('#page-wrap').fadeIn(1000);

	// Wait for SoundManager2 to load properly
	soundManager.onready(function() {
		
		// ## SoundCloud
		var consumer_key = "0beb068ff1705acd0bf6d26f566ef560",
			url = "http://soundcloud.com/harvard-lil/sets/thelibrary-fm";		
		
		// Resolve the given url and get the full JSON-worth of data from SoundCloud regarding the playlist and the tracks within.		
		$.getJSON('http://api.soundcloud.com/resolve?url=' + url + '&format=json&consumer_key=' + consumer_key + '&callback=?', function(playlist){

			// Loop through each of the tracks
			$.each(playlist.tracks, function(index, track) {

				// Create a list item for each track and associate the track *data* with it.
				$('<li>' + track.title + '</li>').data('track', track).appendTo('.tracks');

				// * Get appropriate stream url depending on whether the playlist is private or public.
				// * If the track includes a *secret_token* add a '&' to the url, else add a '?'.
				// * Finally, append the consumer key and you'll have a working stream url.
				url = track.stream_url;
				
				(url.indexOf("secret_token") == -1) ? url = url + '?' : url = url + '&';
				
				url = url + 'consumer_key=' + consumer_key;
				
				// **Create the sound using SoundManager2**				
				soundManager.createSound({
					
					id: 'track_' + track.id,
					url: url,
					
					// On play & resume add a *playing* class to the main player div.
					// This will be used in the stylesheet to hide/show the play/pause buttons depending on state.
					
					onplay: function() {
						$('.player').addClass('playing');
						
						// Set the background. local file names are based on soundcloud permalink names
						//$('html').css({'background': 'url(img/' + track.permalink + '.jpg) no-repeat center fixed', 'background-size': 'cover'});

//						$('#cover-image').attr("src", "img/" + track.permalink + ".jpg");
						
//						e.preventDefault();
                        $imgURL = "img/" + track.permalink + ".jpg";
                        $("#cover-image")
                            .fadeOut(200, function() {
                                $("#cover-image").attr('src',$imgURL);
                            })
                            .fadeIn(200);
						
					},
					onresume: function() {
						$('#player').addClass('playing');
					},
					
					// On pause, remove the *playing* class from the main player div.
					onpause: function() {
						$('.player').removeClass('playing');
					},
					
					// When a track finished, call the Next Track function. (Declared at the bottom of this file).
					onfinish: function() {
						nextTrack();
					}	
				});	
			});

			// Start the player with the first track
			$('li:first').click();
			
			// Get our URLs.We're looking to see if we have a playonload=false param
			var urlParams = {};
            (function () {
                var match,
                    pl     = /\+/g,  // Regex for replacing addition symbol with a space
                    search = /([^&=]+)=?([^&]*)/g,
                    decode = function (s) { return decodeURIComponent(s.replace(pl, " ")); },
                    query  = window.location.search.substring(1);

                while (match = search.exec(query))
                   urlParams[decode(match[1])] = decode(match[2]);
            })();

            // if we do have a playonload=false param, pause the playing
            // TODO: clean up this kludge. we should not play at all if playonload=false
            if (Object.prototype.hasOwnProperty.call(urlParams, 'playonload') && urlParams.playonload == 'false'){
                soundManager.togglePause( 'track_' + $('li.active').data('track').id );	
            } 
		});

		// DOM Actions

		// Bind a click event to each list item we created above.
		$('.tracks li').live('click', function(){
			// Create a track variable, grab the data from it, and find out if it's already playing *(set to active)*	
			var $track = $(this),
				data = $track.data('track'),
				playing = $track.is('.active');
					
			if (playing) {			
				// If it is playing: pause it.
				soundManager.pause('track_' + data.id);
			} else {
				
				// If it's not playing: stop all other sounds that might be playing and play the clicked sound.
				if ($track.siblings('li').hasClass('active')) {
				    soundManager.stopAll();
				}
				soundManager.play('track_' + data.id);
			}
			
			// Finally, toggle the *active* state of the clicked li and remove *active* from and other tracks.
			$track.toggleClass('active').siblings('li').removeClass('active');
		});
		
		// Bind a click event to the play / pause button.
		//$('.play, .pause').live('click', function(){
		//	togglePlay();
		//});
		
		// Player Functions

		// **Play/Pause**
		
		var togglePlay = function(){
			if ( $('li').hasClass('active') == true ) {
				// If a track is active, play or pause it depending on current state.
				soundManager.togglePause( 'track_' + $('li.active').data('track').id );	
			} else {
				// If no tracks are active, just play the first one.
				$('li:first').click();
			}
		}
		
		// **Next Track**
		var nextTrack = function(){
			// Stop all sounds
			soundManager.stopAll();
			
			// Click the next list item after the current active one. 
			// If it does not exist *(there is no next track)*, click the first list item.

			if ( $('li.active').next().click().length == 0 ) {
				$('.tracks li:first').click();
			}
		}
		
		// **Prev Track**
		var prevTrack = function(){
			// Stop all sounds
			soundManager.stopAll();
			
			// Click the next list item after the current active one. 
			// If it does not exist *(there is no next track)*, click the first list item.

			if ( $('li.active').prev().click().length == 0 ) {
				$('.tracks li:last').click();
			}
		}
        
		
		$(document).bind('keydown',function(e) {
            if (e.which==13 || e.which==27 || e.which==32 || e.which==37 || e.which==38 || e.which==39 || e.which==40) {
                e.preventDefault();
                if (e.which==37 || e.which==38) {
                    prevTrack();
                }
                if (e.which==39 || e.which==40) {
                    nextTrack();
                }
                if (e.which==32 || e.which==13 || e.which==27) {
                    togglePlay();
                }
            }
        });
	});
	
});