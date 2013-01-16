var types = {
	audio: {
		name: "Audio",
		options: {
			audio: {
				name: "Audio by URL",
				exampleURL: "http://example.com/myaudio.mp3",
				getEmbedData: function(url) {
					return "<audio src=\"" + url + "\" width=\"300\" controls>You cannot hear this because your browser does not support HTML5 audio.</audio>";
				},
				width: 300,
				height: 30,
				isDefault: false
			},
			soundcloud: {
				name: "SoundCloud",
				exampleURL: "http://soundcloud.com/username/sound-name",
				getEmbedData: function(url) {
					//var oembedURL = "http://soundcloud.com/oembed?format=json&url=" + encodeURIComponent(url);
					return "<p>SoundCloud embedding not yet implemented.</p>";
				},
				width: 550,
				height: 300,
				isDefault: true
			}
		}
	},
	video: {
		name: "Video",
		options: {
			dailymotion: {
				name: "DailyMotion",
				exampleURL: "http://www.dailymotion.com/video/abcdef_video-name",
				getEmbedData: function(url) {
					var vidIDRegex = /dailymotion\.com\/video\/(\w+)_.*$/;
					var vidID;
					if(!vidIDRegex.test(url)) {
						return null;
					} else {
						vidID = vidIDRegex.exec(url)[1];
					}
					return "<iframe frameborder=\"0\" width=\"480\" height=\"270\" src=\"http://www.dailymotion.com/embed/video/" + vidID + "\"></iframe>";
				},
				width: 480,
				height: 270,
				isDefault: false
			},
			twitch: {
				name: "Twitch LiveStream",
				exampleURL: "http://www.twitch.tv/username",
				getEmbedData: function(url) {
					var channelRegex = /\/(\w+$)/;
					var channel;
					if(!channelRegex.test(url)) {
						return null;
					} else {
						channel = channelRegex.exec(url)[1];
					}
					return "<object type=\"application/x-shockwave-flash\" height=\"378\" width=\"620\" id=\"live_embed_player_flash\" data=\"http://www.twitch.tv/widgets/live_embed_player.swf?channel=" + channel + "\" bgcolor=\"#000000\"><param name=\"allowFullScreen\" value=\"true\" /><param name=\"allowScriptAccess\" value=\"always\" /><param name=\"allowNetworking\" value=\"all\" /><param name=\"movie\" value=\"http://www.twitch.tv/widgets/live_embed_player.swf\" /><param name=\"flashvars\" value=\"hostname=www.twitch.tv&channel=" + channel + "&start_volume=25\" /></object>";
				},
				width: 620,
				height: 378,
				isDefault: false
			},
			video: {
				name: "Video by URL",
				exampleURL: "http://example.com/myvideo.webm",
				getEmbedData: function(url) {
					return "<video src=\"" + url + "\" width=\"550\" height=\"400\" controls>You cannot see this video because your browser does not support HTML5 video.</video>";
				},
				width: 550,
				height: 400,
				isDefault: false
			},
			vimeo: {
				name: "Vimeo",
				exampleURL: "http://vimeo.com/12345678",
				getEmbedData: function(url) {
					var vidIDRegex = /\/(\w+$)/;
					var vidID;
					if(!vidIDRegex.test(url)) {
						return null;
					} else {
						vidID = vidIDRegex.exec(url)[1];
					}
					//var oembedURL = "http://vimeo.com/api/oembed.json?url=" + encodeURIComponent(url);
					return "<iframe src=\"http://player.vimeo.com/video/" + vidID + "?color=ffffff\" width=\"500\" height=\"213\" frameborder=\"0\" webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe>";
				},
				width: 500,
				height: 281,
				isDefault: false
			},
			youtube: {
				name: "YouTube",
				exampleURL: "http://www.youtube.com/watch?v=AAAAAAAAAAA",
				getEmbedData: function(url) {
					var vidIDRegex = /youtube\.com\/watch\?v=([^&]+)/;
					var vidID;
					if(!vidIDRegex.test(url)) {
						return null;
					} else {
						vidID = vidIDRegex.exec(url)[1];
					}
					return "<iframe width=\"560\" height=\"315\" src=\"http://www.youtube.com/embed/" + vidID + "?rel=0\" frameborder=\"0\" allowfullscreen></iframe>";
				},
				width: 560,
				height: 315,
				isDefault: true
			}
		}
	}
};

var contentContainer;
var typeSelect;
var sourceSelect;
var urlInput;
var type;
var source;
var url;

function init() {
	// confirm gadget is running in wave container
	if(wave && wave.isInWaveContainer()) {
		// get references to HTML elements
		contentContainer = document.getElementById("content");
		typeSelect = document.getElementById("type");
		sourceSelect = document.getElementById("source");
		urlInput = document.getElementById("url");
		/*
		// load state
		var state = wave.getState();
		if(state) { // avoid bug in which wave.getState() returns null
			type = typeSelect.value = state.get("type", "video");
			source = sourceSelect.value = state.get("source", "youtube");
			url = urlInput.value = state.get("url", "");
		}
		*/
		// add event listeners
		typeSelect.addEventListener("change", typeChanged, false);
		sourceSelect.addEventListener("change", sourceChanged, false);
		urlInput.addEventListener("change", urlChanged, false);
		wave.setModeCallback(modeChanged);
		wave.setStateCallback(stateChanged);
	}
}
gadgets.util.registerOnLoadHandler(init);

function stateChanged(newState) {
	var newType = newState.get("type", type);
	if(newType != type) {
		//type = newType;
		typeSelect.value = newType;
		typeChanged();
	}
	var newSource = newState.get("source", source);
	if(newSource != source) {
		//source = newSource;
		sourceSelect.value = newSource;
		sourceChanged();
	}
	var newURL = newState.get("url", url);
	if(newURL != url) {
		//url = newURL;
		urlInput.value = newURL;
		urlChanged();
	}
}
function modeChanged(newMode) {
	if(newMode == wave.Mode.EDIT) {
		document.getElementById("content").style.display = "none";
		document.getElementById("settings").style.display = "block";
	} else {
		document.getElementById("settings").style.display = "none";
		
		var delta = {};
		var state = wave.getState();
		if(state) { // avoid bug in which wave.getState() retuns null
			if(type != state.get("type")) {
				delta.type = type;
			}
			if(source != state.get("source")) {
				delta.source = source;
			}
			if(url != state.get("url")) {
				delta.url = url;
			}
			state.submitDelta(delta);
		}
		
		gadgets.window.adjustWidth(contentContainer.style.width);
		gadgets.window.adjustHeight(contentContainer.style.height);
		
		document.getElementById("content").style.display = "block";
		
	}
}
function typeChanged() {
	var newType = document.getElementById("type").value;
	// stop if type has not actually changed
	if(newType == type || newType == "") {
		return;
	}
	
	// update JS value
	type = newType;
	
	// update source options
	sourceSelect.innerHTML = "";
	var srcTypes = types[newType].options;
	for(var srcType in srcTypes) {
		var newOption = document.createElement("option");
		newOption.value = srcType;
		newOption.innerHTML = srcTypes[srcType].name;
		newOption.selected = srcTypes[srcType].isDefault;
		sourceSelect.appendChild(newOption);
	}
	
	sourceChanged();
}
function sourceChanged() {
	var newSource = document.getElementById("source").value;
	// stop if source has not actually changed
	if(newSource == source || newSource == "") {
		return;
	}
	
	// update JS value
	source = newSource;
	
	var sourceData = types[type].options[newSource];
	// update example URL
	urlInput.value = "";
	urlInput.placeholder = sourceData.exampleURL;
	// update gadget size for new potential contents
	contentContainer.style.width = sourceData.width;
	contentContainer.style.height = sourceData.height;
	gadgets.window.adjustWidth(sourceData.width);
	gadgets.window.adjustHeight(sourceData.height < 82 ? 82 : sourceData.height);
	
	urlChanged();
}
function urlChanged() {
	var newURL = document.getElementById("url").value;
	// stop if URL has not actually changed
	if(newURL == url) {
		return;
	}
	
	// update JS value
	url = newURL;
	
	// update embed code
	if(validateURL(url)) {
		var newEmbedData = types[type].options[source].getEmbedData(url);
		if(!newEmbedData) {
			contentContainer.innerHTML = "<p>No embedded content has been chosen.  Please switch to edit mode and enter a valid URL to embed.</p>";
			urlInput.style.backgroundColor = "#FFAAAA";
		} else if(newEmbedData != contentContainer.innerHTML) {
			contentContainer.innerHTML = newEmbedData;
			
			urlInput.style.backgroundColor = null;
		}
	} else {
		contentContainer.innerHTML = "<p>No embedded content has been chosen.  Please switch to edit mode and enter a valid URL to embed.</p>";
		urlInput.style.backgroundColor = "#FFAAAA";
	}
}

function validateURL(url) {
	return true;
}
