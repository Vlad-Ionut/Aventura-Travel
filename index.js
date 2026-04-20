const express= require("express");
const path= require("path");
const sharp=require('sharp');
const fs=require("fs");
const sass=require("sass");

app= express();
app.set("view engine", "ejs")



obGlobal={
    obErori:null,
    obImagini:null,
    folderScss: path.join(__dirname,"resurse/scss"),
    folderCss: path.join(__dirname,"resurse/css"),
    folderBackup: path.join(__dirname,"backup"),
}

console.log("Folder index.js", __dirname);
console.log("Folder curent (de lucru)", process.cwd());
console.log("Cale fisier", __filename);

let vect_foldere=[ "temp", "logs", "backup", "fisiere_uploadate" ]
for (let folder of vect_foldere){
    let caleFolder=path.join(__dirname, folder);
    if (!fs.existsSync(caleFolder)) {
        fs.mkdirSync(path.join(caleFolder), {recursive:true});   
    }
}

app.use("/resurse",express.static(path.join(__dirname, "resurse")));
app.use("/dist",express.static(path.join(__dirname, "/node_modules/bootstrap/dist")));

app.get("/favicon.ico", function(req, res){
    res.sendFile(path.join(__dirname,"resurse/imagini/favicon/favicon.ico"))
});

function filtreazaImaginiDupaOra(oraCurenta){
    if (!obGlobal.obImagini || !Array.isArray(obGlobal.obImagini.imagini))
        return [];

    let rezultat = [];
    for (let imag of obGlobal.obImagini.imagini){
        if (!Array.isArray(imag.intervale_ore))
            continue;

        let afiseaza = false;
        for (let interval of imag.intervale_ore){
            if (!Array.isArray(interval) || interval.length !== 2)
                continue;

            const start = interval[0];
            const end = interval[1];
            if (oraCurenta >= start && oraCurenta <= end){
                afiseaza = true;
                break;
            }
        }

        if (afiseaza)
            rezultat.push(imag);
    }
    return rezultat;
}

app.get(["/", "/index","/home"], function(req, res){
    const oraCurenta = new Date().getHours();
    const imaginiFiltrate = filtreazaImaginiDupaOra(oraCurenta);

    res.render("pagini/index", {
        ip: req.ip,
        imagini: imaginiFiltrate
    });
});

// app.get("/despre", function(req, res){
//     res.render("pagini/despre");
// });


// ---------------- Verificare configuratie erori ----------------

function verificaProprietatiDuplicateJson(continut){
    // cautam obiecte ({ ... }) si, pentru fiecare, verificam daca exista proprietati repetate
    let stiva = [];
    for (let i = 0; i < continut.length; i++){
        let ch = continut[i];
        if (ch === "{"){
            stiva.push(i);
        } else if (ch === "}"){
            let start = stiva.pop();
            if (start !== undefined){
                let objStr = continut.slice(start, i + 1);
                let reProp = /"([^"\\]+)"\s*:/g;
                let vazute = {};
                let m;
                while ((m = reProp.exec(objStr))){
                    let numeProp = m[1];
                    if (vazute[numeProp]){
                        console.error("[ERORI] Proprietatea '" + numeProp + "' este specificata de mai multe ori intr-un obiect JSON. Fragment: " + objStr.substring(0, 80).replace(/\s+/g, " ") + "...");
                        break;
                    }
                    vazute[numeProp] = true;
                }
            }
        }
    }
}

function verificaSiIncarcaErori(){
    const caleJson = path.join(__dirname, "resurse/json/erori.json");

    // 1) Nu exista fisierul erori.json
    if (!fs.existsSync(caleJson)){
        console.error("[ERORI] Nu exista fisierul de configurare erori.json la calea:", caleJson);
        process.exit(1);
    }

    const continut = fs.readFileSync(caleJson).toString("utf-8");

    // 2) Proprietate specificata de mai multe ori intr-un obiect (verificare pe string)
    verificaProprietatiDuplicateJson(continut);

    let erori;
    try{
        erori = JSON.parse(continut);
    } catch (e){
        console.error("[ERORI] Fisierul erori.json nu contine un JSON valid:", e.message);
        process.exit(1);
    }

    // 3) Lipsa proprietati de baza: info_erori, cale_baza, eroare_default
    const propOblig = ["info_erori", "cale_baza", "eroare_default"];
    for (let prop of propOblig){
        if (!(prop in erori)){
            console.error(`[ERORI] Proprietatea obligatorie "${prop}" lipseste din erori.json.`);
        }
    }

    // 4) Pentru eroarea default lipsesc titlu, text sau imagine
    const errDefault = erori.eroare_default || {};
    const propDefault = ["titlu", "text", "imagine"];
    for (let prop of propDefault){
        if (!errDefault[prop]){
            console.error(`[ERORI] Proprietatea obligatorie "${prop}" lipseste in eroare_default.`);
        }
    }

    // 5) Verificare existenta folder cale_baza si a fisierelor imagine
    if (typeof erori.cale_baza === "string"){
        let caleBaza = erori.cale_baza;
        // transformam in cale fizica pe disc
        let caleFolderFs = path.isAbsolute(caleBaza)
            ? path.join(__dirname, caleBaza.replace(/^\\\//, ""))
            : path.join(__dirname, caleBaza);

        if (!fs.existsSync(caleFolderFs)){
            console.error(`[ERORI] Folderul specificat in "cale_baza" nu exista: ${caleFolderFs}`);
        }

        const imaginiDeVerificat = [];
        if (errDefault.imagine){
            imaginiDeVerificat.push({ tip: "eroare_default", imagine: errDefault.imagine });
        }
        if (Array.isArray(erori.info_erori)){
            erori.info_erori.forEach((e, idx) => {
                if (e && e.imagine){
                    imaginiDeVerificat.push({ tip: `info_erori[${idx}]`, imagine: e.imagine });
                }
            });
        }

        for (let info of imaginiDeVerificat){
            const caleImgFs = path.join(caleFolderFs, info.imagine);
            if (!fs.existsSync(caleImgFs)){
                console.error(`[ERORI] Imaginea asociata ${info.tip} nu exista: ${caleImgFs}`);
            }
        }
    }

    // 6) Exista mai multe erori cu acelasi identificator
    if (Array.isArray(erori.info_erori)){
        const mapId = new Map();
        for (let eroare of erori.info_erori){
            if (!eroare || eroare.identificator === undefined) continue;
            const id = eroare.identificator;
            if (!mapId.has(id)) mapId.set(id, []);
            mapId.get(id).push(eroare);
        }

        for (let [id, lista] of mapId.entries()){
            if (lista.length > 1){
                const faraId = lista.map(e => {
                    const { identificator, ...rest } = e;
                    return rest;
                });
                console.error(`[ERORI] Exista mai multe erori cu acelasi identificator ${id}. Proprietatile (fara identificator) sunt: ${JSON.stringify(faraId)}.`);
            }
        }
    }

    return erori;
}

function initErori(){
    let erori = verificaSiIncarcaErori();
    obGlobal.obErori = erori;

    let err_default = erori.eroare_default;
    err_default.imagine = path.join(erori.cale_baza, err_default.imagine);
    for (let eroare of erori.info_erori){
        eroare.imagine = path.join(erori.cale_baza, eroare.imagine);
    }
}
initErori();


function afisareEroare(res, identificator, titlu, text, imagine){
    //TO DO cautam eroarea dupa identificator
    let eroare= obGlobal.obErori.info_erori.find((elem) => 
        elem.identificator == identificator
    )
    //daca sunt setate titlu, text, imagine, le folosim, 
    //altfel folosim cele din fisierul json pentru eroarea gasita
    //daca nu o gasim, afisam eroarea default
    let errDefault= obGlobal.obErori.eroare_default;
    if(eroare?.status)
        res.status(eroare.identificator)
    res.render("pagini/eroare",{
        imagine: imagine || eroare?.imagine || errDefault.imagine,
        titlu: titlu || eroare?.titlu || errDefault.titlu,
        text: text || eroare?.text || errDefault.text,
    });

}


app.get("/eroare", function(req, res){
    afisareEroare(res,404, "Titlu!!!")
});

// ---------------- Verificare configuratie imagini galerie ----------------

function verificaDateImagini(){
    const caleJsonGalerie = path.join(__dirname, "resurse/json/galerie.json");

    if (!fs.existsSync(caleJsonGalerie)){
        console.error("[IMAGINI] Nu exista fisierul galerie.json la calea:", caleJsonGalerie);
        return;
    }

    let continutGalerie;
    try{
        continutGalerie = fs.readFileSync(caleJsonGalerie).toString("utf-8");
    } catch (e){
        console.error("[IMAGINI] Nu s-a putut citi fisierul galerie.json:", e.message);
        return;
    }

    let obGalerie;
    try{
        obGalerie = JSON.parse(continutGalerie);
    } catch (e){
        console.error("[IMAGINI] Fisierul galerie.json nu contine un JSON valid:", e.message);
        return;
    }

    const caleGalerie = obGalerie.cale_galerie;
    if (typeof caleGalerie !== "string" || !caleGalerie.trim()){
        console.error("[IMAGINI] Proprietatea 'cale_galerie' lipseste sau nu este un string in galerie.json.");
        return;
    }

    // 1) Folderul specificat in "cale_galerie" nu exista
    const caleGalerieAbs = path.join(__dirname, caleGalerie);
    if (!fs.existsSync(caleGalerieAbs)){
        console.error(`[IMAGINI] Folderul specificat in 'cale_galerie' nu exista pe disc: ${caleGalerieAbs}. Verificati ca calea relativa din galerie.json este corecta.`);
    }

    // 2) Verificam ca toate fisierele imagine din lista exista
    if (!Array.isArray(obGalerie.imagini)){
        console.error("[IMAGINI] Proprietatea 'imagini' din galerie.json nu este un array. Nu se pot verifica fisierele imagine.");
        return;
    }

    for (const imag of obGalerie.imagini){
        if (!imag || typeof imag.cale_relativa !== "string"){
            console.error("[IMAGINI] Un element din 'imagini' nu are proprietatea 'cale_relativa' (string). Intrarea completa este:", imag);
            continue;
        }

        const caleFisierAbs = path.join(caleGalerieAbs, imag.cale_relativa);
        if (!fs.existsSync(caleFisierAbs)){
            console.error(`[IMAGINI] Fisierul imagine specificat in galerie.json nu exista: '${imag.cale_relativa}'. Cale cautata: ${caleFisierAbs}. Verificati 'cale_galerie' si 'cale_relativa' pentru aceasta imagine.`);
        }
    }
}

verificaDateImagini();

function initImagini(){
    var continut= fs.readFileSync(path.join(__dirname,"resurse/json/galerie.json")).toString("utf-8");

    obGlobal.obImagini=JSON.parse(continut);
    let vImagini=obGlobal.obImagini.imagini;
    let caleGalerie=obGlobal.obImagini.cale_galerie

    let caleAbs=path.join(__dirname,caleGalerie);
    let caleAbsMediu=path.join(caleAbs, "mediu");
    let caleAbsMic=path.join(caleAbs, "mic");
    if (!fs.existsSync(caleAbsMediu))
        fs.mkdirSync(caleAbsMediu);
    if (!fs.existsSync(caleAbsMic))
        fs.mkdirSync(caleAbsMic);
    
    for (let imag of vImagini){
        let [numeFis, ext]=imag.cale_relativa.split(".");
        let caleFisAbs=path.join(caleAbs,imag.cale_relativa);
		let caleFisMicAbs=path.join(caleAbsMic, numeFis+".webp");
		let caleFisMediuAbs=path.join(caleAbsMediu, numeFis+".webp");

		if (!fs.existsSync(caleFisMicAbs)){
			sharp(caleFisAbs).resize(200).toFile(caleFisMicAbs);
		}
		if (!fs.existsSync(caleFisMediuAbs)){
			sharp(caleFisAbs).resize(400).toFile(caleFisMediuAbs);
		}

		imag.fisier_mic=path.join("/", caleGalerie, "mic", numeFis+".webp" );
		imag.fisier_mediu=path.join("/", caleGalerie, "mediu", numeFis+".webp" );
		imag.fisier=path.join("/", caleGalerie, imag.cale_relativa );
    }
    // console.log(obGlobal.obImagini)
}
initImagini();



function compileazaScss(caleScss, caleCss){
    if(!caleCss){
        // Bonus 4: suport și pentru fișiere cu mai multe puncte, ex. "stil.frumos.scss"
        // path.parse(caleScss).name returnează numele fără ultima extensie, dar păstrează punctele intermediare
        const infoScss = path.parse(caleScss); // { name: "a" } sau { name: "stil.frumos" }
        caleCss = infoScss.name + ".css"; // ex. "stil.frumos.css"
    }
    
    if (!path.isAbsolute(caleScss))
        caleScss=path.join(obGlobal.folderScss,caleScss )
    if (!path.isAbsolute(caleCss))
        caleCss=path.join(obGlobal.folderCss,caleCss )
    
    let caleBackup=path.join(obGlobal.folderBackup, "resurse/css");
    if (!fs.existsSync(caleBackup)) {
        fs.mkdirSync(caleBackup,{recursive:true})
    }
    
    // la acest punct avem cai absolute in caleScss si  caleCss

    // Bonus 3: salvăm versiunile vechi în backup cu timestamp în nume
    // ex: a.css -> a_1681124489791.css
    if (fs.existsSync(caleCss)){
        const infoFisCss = path.parse(caleCss); // { name: "a", ext: ".css" } sau { name: "stil.frumos", ext: ".css" }
        const timestamp = Date.now();
        const numeFisCssBackup = `${infoFisCss.name}_${timestamp}${infoFisCss.ext}`;
        fs.copyFileSync(
            caleCss,
            path.join(obGlobal.folderBackup, "resurse/css", numeFisCssBackup)
        );
    }
    rez=sass.compile(caleScss, {"sourceMap":true});
    fs.writeFileSync(caleCss,rez.css)
    
}


//la pornirea serverului
vFisiere=fs.readdirSync(obGlobal.folderScss);
for( let numeFis of vFisiere ){
    if (path.extname(numeFis)==".scss"){
        compileazaScss(numeFis);
    }
}


fs.watch(obGlobal.folderScss, function(eveniment, numeFis){
    if (eveniment=="change" || eveniment=="rename"){
        let caleCompleta=path.join(obGlobal.folderScss, numeFis);
        if (fs.existsSync(caleCompleta)){
            compileazaScss(caleCompleta);
        }
    }
})


app.get("/*pagina", function(req, res){
    console.log("Cale pagina", req.url);
    if (req.url.startsWith("/resurse") && path.extname(req.url)==""){
        afisareEroare(res,403);
        return;
    }
    if (path.extname(req.url)==".ejs"){
        afisareEroare(res,400);
        return;
    }
    try{
        res.render("pagini"+req.url, function(err, rezRandare){
            if (err){
                if (err.message.includes("Failed to lookup view")){
                    afisareEroare(res,404)
                }
                else{
                    afisareEroare(res);
                }
            }
            else{
                res.send(rezRandare);
                console.log("Rezultat randare", rezRandare);
            }
        });
    }
    catch(err){
        if (err.message.includes("Cannot find module")){
            afisareEroare(res,404)
        }
        else{
            afisareEroare(res);
        }
    }
});

app.get("/cale",function(req,res){
    console.log("Am primit o cerere la /cale");
    res.send("Raspuns la <b style='color: blue;'>cererea pentru /cale</b>");
});


app.get("/cale2",function(req,res){
    res.write("ceva");
    res.write("altceva");
    res.end();
});

app.get("/cale2/:a/:b",function(req,res){
    res.send(parseInt(req.params.a) + " + " + parseInt(req.params.b))
});

app.get("/cale2/:a/:b",function(req,res){
    res.send(parseInt(req.params.a) + " + " + parseInt(req.params.b))
});






app.listen(8080);
console.log("Serverul a pornit!");