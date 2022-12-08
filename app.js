import * as dotenv from 'dotenv'
dotenv.config()

import inquirer from "inquirer";
import { inquirerMenu, leerInput, listarLugares, pausa } from "./helpers/inquirer.js";
import { Busquedas } from "./models/busquedas.js";


const main = async() => {
    const busquedas = new Busquedas();
    let opt = 0

    do {

        opt = await inquirerMenu();
        
        switch ( opt ) {
            case 1:
                //!Mostrar mensaje
                const termino = await leerInput('Ciudad:');

                
                //!Buscar los lugares
                //obtenemos los resultados de la busqueda del lugar que el usuario desea
                const lugares = await busquedas.ciudad( termino );

                
                
                //Si la ciudad no existe, enviara un mensajes
                if (lugares.length === 0) {
                    console.log('Ciudad no encontrada');
                } else {
                    
                    //!El usuario tendra que seleccionar el lugar
                    //El id del lugar seleccionado por el usuario
                    const id = await listarLugares(lugares);
                    const lugarSeleccionado = lugares.find( e => e.id === id );

                    if (id === '0') continue;
                    
                    //Guardando en DB
                    busquedas.agregarHistorial( lugarSeleccionado.nombre );

                    //!Mostrar datos del clima
                    
                    const clima = await busquedas.climaLugar( lugarSeleccionado.lat, lugarSeleccionado.lng )

                    //!Mostrar resultados
                    
                    console.clear();
                    console.log('\nInformacion de la ciudad\n');
                    console.log('Ciudad: ',lugarSeleccionado.nombre.green );
                    console.log('Lat:',lugarSeleccionado.lat);
                    console.log('Lng: ',lugarSeleccionado.lng);
                    console.log('Temperatura: ', clima.temp);
                    console.log('Minima: ', clima.min);
                    console.log('Maxima: ', clima.max);
                    console.log('El clima esta: ',clima.desc.green);
                }

                break;
        
            case 2:

                busquedas.historialCapitalizado.forEach((lugar, indice) => {
                    const idx = `${indice + 1}.`.green
                    console.log(`${ idx } ${ lugar }`);
                })

                break;
        }



        if(opt !== 0) await pausa();
        


    } while (opt !== 0);

}

main();
