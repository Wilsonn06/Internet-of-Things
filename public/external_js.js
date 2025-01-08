let reloadCounter = 0;
setInterval(() => {
    fetch('/api/data')
      .then((response) => response.json())
      .then((data) => {
        console.log(data); // Log data to ensure it updates
        document.getElementById('co2-sensor1').textContent = data.sensor1.co2;
        document.getElementById('nh3-sensor1').textContent = data.sensor1.nh3;
        document.getElementById('nox-sensor1').textContent = data.sensor1.nox;

        document.getElementById('co2-sensor2').textContent = data.sensor2.co2;
        document.getElementById('nh3-sensor2').textContent = data.sensor2.nh3;
        document.getElementById('nox-sensor2').textContent = data.sensor2.nox;

        document.getElementById('co2-sensor3').textContent = data.sensor3.co2;
        document.getElementById('nh3-sensor3').textContent = data.sensor3.nh3;
        document.getElementById('nox-sensor3').textContent = data.sensor3.nox;
      })
      .catch((error) => console.error('Error fetching data:', error));
    
    
  }, 1000);

setInterval(()=>{
    window.location.reload();
},1000);