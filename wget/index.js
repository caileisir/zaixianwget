var spawn = require('child_process').spawn;
var archiver = require('../archiver');

function emitProgress(io, data, progress, error) {
    if (!io || !data || !data.token) {
        return;
    }

    io.emit(data.token, {
        progress: progress,
        error: error ? error.message : undefined
    });
}

function parseDownloadRequest(website) {
    if (typeof website !== 'string' || website.trim() === '') {
        throw new Error('Please enter a valid website URL.');
    }

    var parsed;
    try {
        parsed = new URL(website.trim());
    } catch (err) {
        throw new Error('Please enter a valid website URL.');
    }

    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        throw new Error('Website URL must use http or https.');
    }

    if (!parsed.host) {
        throw new Error('Please enter a valid website URL.');
    }

    return {
        url: parsed.toString(),
        folder: parsed.host
    };
}

function downloadWebsite(io, data) {

// download all website assets 
/**
 * wget --mirror --convert-links --adjust-extension --page-requisites 
 * --no-parent http://example.org
 * --mirror – Makes (among other things) the download recursive.
 * --convert-links – convert all the links (also to stuff like CSS stylesheets) to relative, so it will be suitable for offline viewing.
 * --adjust-extension – Adds suitable extensions to filenames (html or css) depending on their content-type.
 * --page-requisites – Download things like CSS style-sheets and images required to properly display the page offline.
 * --no-parent – When recurring do not ascend to the parent directory. It useful for restricting the download to only a portion of the site.
 */
var request;
try {
    request = parseDownloadRequest(data && data.website);
} catch (err) {
    emitProgress(io, data, 'Error: ' + err.message, err);
    return;
}

var child = spawn('wget', ['-mkEpnp', '--no-if-modified-since', request.url]);
var spawnFailed = false;

// read stdout from the current child.
child.stderr.on("data",function(response){

    emitProgress(io, data, response.toString());
});

child.stdout.on("data",function(response){

    emitProgress(io, data, response.toString());
});

child.on('error', function(err) {
    spawnFailed = true;
    emitProgress(io, data, 'Error: wget failed to start. Please install wget and try again.', err);
});

child.on('close',function(code, signal){
    if (spawnFailed) {
        return;
    }

    if (code !== 0) {
        var message = signal
            ? 'wget stopped with signal ' + signal + '.'
            : 'wget exited with code ' + code + '.';
        emitProgress(io, data, 'Error: ' + message, new Error(message));
        return;
    }

    emitProgress(io, data, "Converting");
    archiver(request.folder, io, data);
});
}

downloadWebsite._internals = {
    parseDownloadRequest: parseDownloadRequest
};

module.exports = downloadWebsite;
