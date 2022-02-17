const { spawn } = require('child_process');

let recorder = undefined

function startRecording(recordFilePrefix, interfaceName, port) {
  if (recorder) return false

  let options=['-U', '-i', interfaceName, '-w', `./${recordFilePrefix}-${Date.now()}.pcap`, 'port', `${port}`];

  recorder = spawn('tcpdump', options);
  
  // recorder.stdout.on('data', (data) => {
  //   console.log(`stdout: ${data}`);
  // });
  
  // recorder.stderr.on('data', (data) => {
  //   console.error(`stderr: ${data}`);
  // });
  
  recorder.on('close', (code) => {
    console.log(`TCPDUMP recorder exited with code: ${code}`);
    recorder = undefined
  });

  return true
}

function stopRecording() {
  if (recorder) {
    recorder.kill('SIGHUP');
  }
}

module.exports = {
  startRecording,
  stopRecording
}