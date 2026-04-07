const express= require("express");
const path= require("path");
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

app.get("/favicon.ico", function(req, res){
    res.sendFile(path.join(__dirname,"resurse/imagini/favicon/favicon.ico"))
});

app.get(["/", "/index","/home"], function(req, res){
    res.render("pagini/index", {
        ip: req.ip
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



function compileazaScss(caleScss, caleCss){
    if(!caleCss){

        let numeFisExt=path.basename(caleScss); // "folder1/folder2/a.scss" -> "a.scss"
        let numeFis=numeFisExt.split(".")[0]   /// "a.scss"  -> ["a","scss"]
        caleCss=numeFis+".css"; // output: a.css
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

    let numeFisCss=path.basename(caleCss);
    if (fs.existsSync(caleCss)){
        fs.copyFileSync(caleCss, path.join(obGlobal.folderBackup, "resurse/css",numeFisCss ))// +(new Date()).getTime()
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


app.listen(8080);
console.log("Serverul a pornit!");