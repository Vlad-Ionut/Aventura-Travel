window.onload=function(){

    document.getElementById("inp-pret").onchange=function(){
        let val=this.value.trim();
        document.getElementById("infoRange").innerHTML=`(${val})`;
    }

    document.getElementById("filtrare").onclick=function(){
        let inpNume=document.getElementById("inp-nume").value.trim().toLowerCase()

        let grupRadio=document.getElementsByName("gr_rad")
        let persoaneMin, persoaneMax, isToate=false;
        for(let rad of grupRadio){
            if(rad.checked){
                if(rad.value!="toate"){
                    [persoaneMin, persoaneMax]=rad.value.split(":")
                    persoaneMin=parseInt(persoaneMin)
                    persoaneMax=parseInt(persoaneMax)
                }
                else{
                    isToate=true;
                }
                break;
            }
        }

        let inpPretMin=parseFloat(document.getElementById("inp-pret").value.trim());

        let inpCategorie=document.getElementById("inp-categorie").value.trim().toLowerCase();

        let produse=document.getElementsByClassName("produs")
        for (let prod of produse){
            prod.style.display="none"

            let nume= prod.getElementsByClassName("val-nume")[0].innerHTML.trim().toLowerCase()
            let cond1=nume.includes(inpNume)


            let persoane=parseInt(prod.getElementsByClassName("val-persoane")[0].innerHTML.trim())
            let cond2=persoane>=persoaneMin && persoane<persoaneMax||isToate;
            
            let pret=parseFloat(prod.getElementsByClassName("val-pret")[0].innerHTML.trim())
            let cond3=pret>=inpPretMin

            let cond4=prod.getElementsByClassName("val-categorie")[0].innerHTML.trim().toLowerCase()==inpCategorie||inpCategorie=="toate";

            if (cond1&&cond2&&cond3&&cond4){
                prod.style.display="block"
            }
        }
    }
    document.getElementById("resetare").onclick=function(){
        document.getElementById("inp-nume").value=""
        document.getElementById("inp-pret").value="0"
        document.getElementById("infoRange").innerHTML="(0)"
        document.getElementById("inp-categorie").value="toate"
        document.getElementById("i_rad4").checked=true

        let produse=document.getElementsByClassName("produs")
        for (let prod of produse){
            prod.style.display="block"
        }

    }


    function sorteaza(semn){
        let produse=document.getElementsByClassName("produs")
        let vProduse= Array.from(produse)
        vProduse.sort(function(a,b){
            let pretA=parseFloat(a.getElementsByClassName("val-pret")[0].innerHTML.trim())
            let pretB=parseFloat(b.getElementsByClassName("val-pret")[0].innerHTML.trim())
            if (pretA==pretB){
                let numeA=a.getElementsByClassName("val-nume")[0].innerHTML.trim().toLowerCase()
                let numeB=b.getElementsByClassName("val-nume")[0].innerHTML.trim().toLowerCase()
                return semn*numeA.localeCompare(numeB)
            }

            return semn*(pretA-pretB)
        })
        for (let prod of vProduse){
            prod.parentElement.appendChild(prod)
        }
    }

    document.getElementById("sortCrescNume").onclick=function(){sorteaza(1)}
    document.getElementById("sortDescrescNume").onclick=function(){sorteaza(-1)}

    window.onkeydown=function(e){
        if (e.key=="c" && e.altKey){
            let produse=document.getElementsByClassName("produs")
            let suma=0;
            for (let prod of produse){
                if (prod.style.display!="none"){
                    suma+=parseFloat(prod.getElementsByClassName("val-pret")[0].innerHTML.trim())
                }
            }
            let p =this.document.getElementById("infoSuma")
            if(!p){
                p= this.document.createElement("p")
                p.innerHTML=suma
                p.id="infoSuma"
                let sectiuneProduse=this.document.getElementById("produse")
                sectiuneProduse.parentElement.insertBefore(p, sectiuneProduse)
                this.setTimeout(function(){
                    let p1 =this.document.getElementById("infoSuma")
                    p1.remove()
                }, 2000)
            }
            else{
                p.innerHTML=suma
            }
            
        }

    }
   
}