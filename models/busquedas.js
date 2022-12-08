import fs from "fs";

import axios from "axios";

//Esta clase es la encargada de realizar las busquedas
class Busquedas {
    historial = ['Tegucigalpa', 'Madrid', 'San Jose'];
    dbPath = './db/database.json'
    constructor(){
        //TODO: LeerDB si existe
        this.leerDB();
    }

    //Retornamos el hostorial pero cada palabra tiene mayuscula su primera letra.
    get historialCapitalizado(){
        //Capitalizar cada palabra
        return this.historial.map(lugar => {
            let palabras = lugar.split(' ');
            palabras = palabras.map(palabra => palabra[0].toUpperCase() + palabra.substring(1));

            return palabras.join(' ')

        })
    }

    get paramsMapBox () {//Parametros para el axios
        return {
            'language':'es',
            'access_token':process.env.MAPBOX_KEY,
            'limit':5,
        }
    }
    get paramsWeather () {//Parametros para el axios
        return {
            'lang':'es',
            'appid':process.env.OPENWEATHER_KEY,
            'units':'metric',
        }
    }
    

    //Metodo para buscar una ciudad
    async ciudad( lugar = '' ) {
        try {

            //Peticion http con axios
            const instance = axios.create({
                baseURL: `https://api.mapbox.com/geocoding/v5/mapbox.places/${lugar}.json `,
                params:this.paramsMapBox, 
            })

            const respuesta = await instance.get();

            // console.log(respuesta.data.features);
    
            return respuesta.data.features.map(lugar => ({
                id: lugar.id,
                nombre: lugar.place_name,
                lng: lugar.center[0],
                lat: lugar.center[1]
            }));

        } catch (error) {
            return []
        }
        //Regresar los lugares que conincida, con el lugar
        //que el usuario busco
    
    }

    async climaLugar( lat, lon ){ 
        try {
            const instance = axios.create({
                baseURL: `https://api.openweathermap.org/data/2.5/weather?`,
                params: {
                    lat,
                    lon,
                    ...this.paramsWeather
                }
            });

            const respuesta = await instance.get();
            
            //Con la respuesta extraer informacion de la data
            const {weather, main} = respuesta.data;
            //retornar objeto
            return {
                desc: weather[0].description,
                min: main.temp_min,
                max: main.temp_max,
                temp: main.temp
            }

        } catch (error) {
            console.log(error);
        }
     }

     agregarHistorial(lugar = '') {
        //Prevenir duplicados
        if ( this.historial.includes(lugar.toLocaleLowerCase()) ) {
            return
        }

        this.historial = this.historial.splice(0,5);
        
        //grabar historial
        this.historial.unshift( lugar.toLocaleLowerCase() );
        
        //Grabando en DB
        this.guardarDB();


     }

     guardarDB(){

        const payload = {
            historial: this.historial
        }

        fs.writeFileSync( this.dbPath, JSON.stringify(payload) )

     }

     leerDB(){
        //La bd debe de existir
        if(fs.existsSync(!this.dbPath)) return;

        //Obteniendo la informacion del archivo .json
        const info = fs.readFileSync(this.dbPath, {encoding: 'utf-8'});
        const data = JSON.parse(info);

        this.historial = data.historial
     }

}


export {
    Busquedas
}


