var archiver = require('archiver');
var fs = require('fs');
var path = require('path');

function emitError(io, data, err) {
  console.error(err);

  if (io && data && data.token) {
    io.emit(data.token, {
      progress: 'Error: ' + err.message,
      error: err.message
    });
  }
}

function assertSafeFolderName(file) {
  if (typeof file !== 'string' || file.trim() === '') {
    throw new Error('Downloaded folder name is missing.');
  }

  if (file === '.' || file === '..' || file.includes('/') || file.includes('\\')) {
    throw new Error('Downloaded folder name is invalid.');
  }

  return file;
}

function buildArchivePaths(rootDir, file) {
  var folderName = assertSafeFolderName(file);
  var root = rootDir || process.cwd();

  return {
    folderName: folderName,
    sourceDir: path.join(root, folderName),
    outputDir: path.join(root, 'public', 'sites'),
    zipPath: path.join(root, 'public', 'sites', folderName + '.zip')
  };
}

function archiveSite(file,io,data){
  var archivePaths;

  try {
    archivePaths = buildArchivePaths(process.cwd(), file);
    if (!fs.existsSync(archivePaths.sourceDir)) {
      throw new Error('Downloaded folder does not exist: ' + archivePaths.sourceDir);
    }
    fs.mkdirSync(archivePaths.outputDir, { recursive: true });
  } catch (err) {
    emitError(io, data, err);
    return;
  }

  var output = fs.createWriteStream(archivePaths.zipPath);
  var archive = archiver('zip', {
    zlib: { level: 9 } // Sets the compression level.
  });
  var finished = false;

  function fail(err) {
    if (finished) {
      return;
    }

    finished = true;
    try {
      archive.abort();
    } catch (abortErr) {
      // Ignore abort errors; the original archive error is the useful one.
    }
    emitError(io, data, err);
  }
 
// listen for all archive data to be written
// 'close' event is fired only when a file descriptor is involved
output.on('close', function() {
  if (finished) {
    return;
  }

  finished = true;
  console.log(archive.pointer() + ' total bytes');
  console.log('archiver has been finalized and the output file descriptor has closed.');
  io.emit(data.token,{progress:"Completed",file:archivePaths.folderName})

});

output.on('error', fail);
 
// This event is fired when the data source is drained no matter what was the data source.
// It is not part of this library but rather from the NodeJS Stream API.
// @see: https://nodejs.org/api/stream.html#stream_event_end
output.on('end', function() {
  console.log('Data has been drained');
});
 
// good practice to catch warnings (ie stat failures and other non-blocking errors)
archive.on('warning', function(err) {
  fail(err);
});
 
// good practice to catch this error explicitly
archive.on('error', function(err) {
  fail(err);
});
 
// pipe archive data to the file
archive.pipe(output);

// append files from a sub-directory and naming it `new-subdir` within the archive

archive.directory(archivePaths.sourceDir,false);

// finalize the archive (ie we are done appending files but streams have to finish yet)
// 'close', 'end' or 'finish' may be fired right after calling this method so register to them beforehand
var finalize = archive.finalize();
if (finalize && typeof finalize.catch === 'function') {
  finalize.catch(fail);
}

 
}

archiveSite._internals = {
  buildArchivePaths: buildArchivePaths
};

module.exports = archiveSite;
