const video = document.getElementById('video')
let i = 0

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
  faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
  faceapi.nets.faceExpressionNet.loadFromUri('/models')
]).then(startVideo)

function startVideo() {
  navigator.getUserMedia(
    { video: {} },
    stream => video.srcObject = stream,
    err => console.error(err)
  )
}

let str = []
function arrayToCSV(objArray) {
  const array = typeof objArray !== 'object' ? JSON.parse(objArray) : objArray;
  let head = `${Object.keys(array[0]).map(value => `"${value}"`).join(",")}` + '\r\n';

  return array.reduce((str, next) => {
      str += `${Object.values(next).map(value => `"${value}"`).join(",")}` + '\r\n';
      return str;
     }, str);
}

var abc = ["_x","_y", "_width","_height","angry", "disgusted", "fearful", "happy", "neutral", "sad", "surprised", "timestamp"];
abc = abc + "\n"
video.addEventListener('play', () => {
  const canvas = faceapi.createCanvasFromMedia(video)
  document.body.append(canvas)
  const displaySize = { width: video.width, height: video.height }
  faceapi.matchDimensions(canvas, displaySize)
  setInterval(async () => {
    const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions()
    let OUTPUT = []
    let date = new Date()
    for (i = 0; i < detections.length; i++) {
      OUTPUT.push({
        ...detections[i].alignedRect._box, 
        ...detections[i].alignedRect._box, 
        ...detections[0].expressions, 
        timestamp: date.getSeconds() + date.getMinutes() * 60
      }) 
    }
    //console.log(OUTPUT)
    if(abc !== undefined)
      abc += (arrayToCSV(OUTPUT));
    else  
      abc = ''
    const resizedDetections = faceapi.resizeResults(detections, displaySize)
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
    faceapi.draw.drawDetections(canvas, resizedDetections)
    // faceapi.draw.drawFaceLandmarks(canvas, resizedDetections)
    faceapi.draw.drawFaceExpressions(canvas, resizedDetections)
  }, 100)
  setInterval(async () => {
    var downloadLink = document.createElement("a");
    var blob = new Blob(["\ufeff", abc]);
    var url = URL.createObjectURL(blob);
    downloadLink.href = url;
    downloadLink.download = "Expression.csv";  //Name the file here
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  }, 10000)
})