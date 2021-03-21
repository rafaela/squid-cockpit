const user = document.getElementById('user');
const senha = document.getElementById('senha');
const nome = document.getElementById('nome');
const tipo = document.getElementById('tipo');
const regra = document.getElementById('regra');
const liberacao = document.getElementById('liberacao');
const bloqueio = document.getElementById('bloqueio');
const flexRadioDefault = document.getElementsByName('flexRadioDefault');
const regraAcesso = document.getElementById('regraAcesso');
const memoria = document.getElementById('memoria');
const tamanho = document.getElementById('tamanho');
const usuarios = document.getElementById('usuarios');
const output_usuario = document.getElementById('output_usuario');
const result_usuario = document.getElementById("result_usuario");
const acls = document.getElementById('acls');
const output_acl = document.getElementById('output_acl');
const regras = document.getElementById('regras');
const output_regra = document.getElementById('output_regra');
const memorias = document.getElementById('memorias');
const output_memoria = document.getElementById('output_memoria');
const reiniciar = document.getElementById('reiniciar');
const reinicar_memoria = document.getElementById('output_reiniciar');
const info = document.getElementById('info');
const output_parar = document.getElementById('output_parar');
const parar = document.getElementById('parar');

var arquivo = '';
var textoArquivo = '';
const confBasica = "auth_param basic program /usr/lib64/squid/basic_ncsa_auth /etc/squid/senhas.txt\nauth_param basic realm Squid proxy-caching web server";
const confBasica1 = "\nacl SSL_ports port 443\nacl CONNECT method CONNECT\n"
const confBasica2 = "http_access deny CONNECT !SSL_ports\nhttp_access allow localhost manager\nhttp_access deny manager\nhttp_access allow localhost"
const confBasica3 = "http_access deny all\n"
const confBasica4 = "coredump_dir /var/spool/squid\nrefresh_pattern ^ftp:		1440	20%	10080\nrefresh_pattern ^gopher:	1440	0%	1440\nrefresh_pattern -i (/cgi-bin/|\?) 0	0%	0 \nrefresh_pattern .		0	20%	4320"
const buscaAcl = "acl SSL_ports port 443"
const buscaRegra = "http_access allow localhost"
const buscaMemoria = "http_access deny all"

window.onload = function(){
	cockpit.spawn(["yum", "-U", "install", "squid"])
	cockpit.spawn(["pgrep", "squid"])
		.then(function(tag){
                	if(tag !== "" || tag !== null){
				info.innerHTML = "O squid está executando."
			}    
			else{
				info.innerHTML = "O squid não está executando."
			}
                 });


	var lista = document.getElementById("lista");
        cockpit.file("/etc/squid/squid.conf").read()
                .then(function(tag){
                        arquivo = tag;
                        var arquivotexto = "";
                        //remove linha
                        if(arquivo !== null && arquivo !== ""){
                                let texto = arquivo.split("\n");
                                for(let i = 0; i < texto.length; i++){
                                        var li = document.createElement("li");
                                        li.innertHTML += "id=" + i;
                                        li.innerHTML += texto[i];
                                        var button = document.createElement('button');
                                        button.setAttribute('id','remove');
                                        button.appendChild(document.createTextNode('Remover'));
                                        li.appendChild(button);
                                        lista.appendChild(li);
                                }
                        }
                });
}

function removeLinha(linha){
	cockpit.file("/etc/squid/squid.conf").read()
		.then(function(tag){
			arquivo = tag;
			var arquivotexto = "";
			//remove linha
			if(arquivo !== null && arquivo !== ""){
				let texto = arquivo.split("\n");
				for(let i = 0; i < texto.length; i++){
					if(texto[i] !== linha){
						textoArquivo = textoArquivo + texto[i] + "\n";
					}
				}
				escreveArquivo(arquivotexto);
			}
		});
}

function criaUsuario(){
	cockpit.spawn(["yum", "-U", "install", "httpd-tools"])
	cockpit.spawn(["touch", "/etc/squid/senhas.txt"])
	cockpit.spawn(["htpasswd", "-b", "/etc/squid/senhas.txt", user.value, senha.value])
		.stream(usuario_output)
		.then()
		.catch();
}


function usuario_output(data){
	output_usuario.append(document.createTextNode(data));
	user.value = "";
	senha.value = "";
}

usuarios.addEventListener("click", criaUsuario);

cockpit.transport.wait(function() { });

function escreveArquivo(novotexto){
	cockpit.file("/etc/squid/squid.conf").replace(novotexto)
		.then(function(tag){
			alert("Arquivo escrito");
		})
		.fail(function (error){
			alert("Falha ao escrever");
		});

}

function leArquivo(){
	cockpit.file("/etc/squid/squid.conf").read()
		.then(function(tag){
			arquivo = tag;
		})
		.fail(function (error){
		        alert("Falha ao ler");
		});
}

function pesquisaEInsereArquivo(pesquisa, textoInserido){
	cockpit.file("/etc/squid/squid.conf").read()
	.then(function(tag){
		arquivo = tag;

		console.log(textoInserido)
		if(arquivo !== "" && arquivo !== null){
			let texto = arquivo.split("\n");
			let textoArquivo = ""
			for(let i = 0; i < texto.length; i++){
				if(texto[i] === pesquisa){
					textoArquivo = textoArquivo + textoInserido + "\n";
				}
				textoArquivo = textoArquivo + texto[i] + "\n";
			
			}
			escreveArquivo(textoArquivo);
		}
		else{
			var texto = confBasica + confBasica1 + confBasica2 + confBasica3 + confBasica4;
		        escreveArquivo(texto);
			cockpit.file("/etc/squid/squid.conf").read()
        			.then(function(tag){
                			arquivo = tag;
                        		let texto = arquivo.split("\n");
                        		let textoArquivo
					console.log(textoInserido)
                        		for(let i = 0; i < texto.length; i++){
						console.log(texto[i])
                                		if(texto[i] === pesquisa){
                                      	 		textoArquivo = textoArquivo + textoInserido + "\n";
                                		}
                               			textoArquivo = textoArquivo + texto[i] + "\n";
                       			 }
                		        escreveArquivo(textoArquivo);
                		});	
		}
	});

}

function criarAcl(){
	acl_output();
}

function acl_output(){
	//leArquivo();
	var comando = "acl " + nome.value + " " + tipo.value + " " + regra.value + "\n";
	//var texto = confBasica + comando + confBasica1 + confBasica2 + confBasica3 + confBasica4;
	pesquisaEInsereArquivo(buscaAcl, comando)
	//escreveArquivo(texto)
    output_acl.append(document.createTextNode(comando));
}

acls.addEventListener("click", criarAcl);

function criarRegra(){
        regra_output();
}

function regra_output(data){
        //leArquivo();
	var comando = "http_access " + regrasAcesso() + " "  + regraAcesso.value + "\n";
	//var texto = confBasica + confBasica1 + confBasica2 + regra + confBasica3 + confBasica4;
	console.log(comando)
	pesquisaEInsereArquivo(buscaRegra, comando)
        output_regra.append(document.createTextNode(comando));
}

regras.addEventListener("click", criarRegra);


function regrasAcesso(){
    var radios = flexRadioDefault;
    for (var i = 0; i < radios.length; i++) {
        if (radios[i].checked) {
            return radios[i].value
        }
    }
    return ""
}

function criarMemoria(){
        memoria_output();
}

function memoria_output(){
        //leArquivo();
        var comando = memoria.value + " " + tamanho.value + "\n";
	console.log(comando)
       // var texto = confBasica + confBasica1 + confBasica2 + regra + confBasica3 + confBasica4;
	pesquisaEInsereArquivo(buscaMemoria, comando)
        output_memoria.append(document.createTextNode(comando));
}

memorias.addEventListener("click", criarMemoria);

function reiniciarServico(){
        cockpit.spawn(["systemctl", "stop", "squid"])
        cockpit.spawn(["systemctl", "start", "squid"])
                .stream(reiniciar_output)
                .then(alert("Reiniciado"))
                .catch();
	cockpit.spawn(["systemctl", "enable", "squid"])
                .stream(reiniciar_output)
                .then()
                .catch();
}

function reiniciar_output(data){
        output_reiniciar.append(document.createTextNode(data));
}

reiniciar.addEventListener("click", reiniciarServico);


function pararServico(){
        cockpit.spawn(["systemctl", "stop", "squid"])
                .stream(reiniciar_output)
                .then(alert("Servico parado"));
}

function parar_output(data){
        output_parar.append(document.createTextNode(data));
}

parar.addEventListener("click", pararServico);


