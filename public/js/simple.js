const e = React.createElement;

 class ProfileManager extends React.Component {
   constructor(props) {
     super(props);
     this.state = {
       newCrew: {name: "", alias: "", sex: "", image: ""},
       crews: [],
       searchWord: ""
     }
     this.token = this.fetchToken();
     this.fetchAll();
   }

   fetchToken() {
     fetch("/token", {credentials: "same-origin"})
     .then(x => x.json())
     .then(json => {
       if (json === null) {
         return;
       }
       this.token = json.token;
     })
     .catch(err => {
       console.error("fetch error", err);
     });
   }

   fetchAll() {
     fetch("api/crews", {})
       .then(x => x.json())
       .then(json => {
         if (json === null) {
           return;
         }
         this.setState({crews: json})
       });
   }

   addCrew(newCrew) {
     if (newCrew.name === "" && newCrew.alias === "" || newCrew.sex === "" ) {
       return;
     }
     var today = new Date();
     var year = today.getFullYear();
     var month = today.getMonth() + 1;
     var day = today.getDate();

     const crew = {
       name: newCrew.name,
       alias: newCrew.alias,
       sex: newCrew.sex,
       image: newCrew.image,
       date: year + "-" + month + "-" + day};
     return fetch("/api/crews", {
       credentials: "same-origin",
       method: "POST",
       headers: {
         "Accept": "application/json",
         "Content-Type": "application/json",
         "X-CSRF-Token": this.token
       },
       body: JSON.stringify(crew)
     })
     .then(resp => {
       if (resp.status === 201) {
         return resp;
       }
       throw new Error(resp.statusText);
     })
     .then(x => x.json())
     .then(data => {
       this.setState({
         newCrew: {name: "", alias: "", sex: "", image: ""},
         crew: [...this.state.crews, data]
       });
       this.fetchAll()
     })
     .catch(err => {
       console.error("post crew error: ", err);
     });
   }

   searchCrew(searchWord) {
     if (searchWord == "") {
       this.fetchAll()
     }
     return fetch("/api/crews/search?sp=" + searchWord, {})
       .then(x => x.json())
       .then(json => {
         if (json === null) {
           return;
         }
         console.log(json)
         this.setState({crews: json})
       });
   }

   renderSearch() {
     return e("div", {className: "msr_search"},
       e("input", {
         id: "search",
         type: "text",
         name: "search",
         value: this.state.searchWord,
         onChange: event => {
           this.setState({searchWord: event.target.value});
         }
       }),
       e("input", {
         type: "submit",
         value: "",
         onClick: () => {
           this.searchCrew(this.state.searchWord);}
       })
     )
   }

   renderCrews() {
     if (this.state.crews == null) {
       return null
     }
     var crewList = []
     var list = []
     this.state.crews.map(function(c, idx) {
       if (idx % 3 != 2) {
         list.push(c)
       } else {
         list.push(c)
         crewList.push(list)
         list = []
       }
     })
     if (list.length != 0) {
       crewList.push(list)
     }
     return e("table", {className: "crew_list"},
       e("tbody", {},
         crewList.map(function(c) {
           return e("tr", {}, c.map(function(c, idx) {
             var len = c.image.length
             var img_file = c.image
             if (c.image.indexOf("C:\\fakepath") !== -1) {
               img_file = img_file.substring(12, len)
             }
             var img_src = "/static/images/" + img_file
             return e("td", {align: "center"},
               e("img", {src: img_src, width: "150px", height: "150px"}),
               e("br"),
               e("a", {href: "/crew/" + c.crew_id}, c.alias)
             );
           }));
         })
       )
     );
   }

   renderForm() {
     const {newCrew} = this.state;
     return e("div", {},
       e("h2", {align: "center"}, "Add Profile"),
       e("div", {className: "msr_text"},
         e("label", {}, "Name"),
         e("input", {
           id: "name",
           name: "name",
           type: "text",
           value: newCrew.name,
           onChange: event => {
             this.setState({newCrew: {
               name: event.target.value,
               alias: newCrew.alias,
               sex: newCrew.sex,
               image: newCrew.image
             }});
           }
         })
       ),
       e("div", {className: "msr_text"},
         e("label", {}, "Alias"),
         e("input", {
           id: "alias",
           name: "alias",
           type: "text",
           value: newCrew.alias,
           onChange: event => {
             this.setState({newCrew: {
               name: newCrew.name,
               alias: event.target.value,
               sex: newCrew.sex,
               image: newCrew.image
             }});
           }
         })
       ),
       e("div", {className: "msr_radio"},
         e("p", {}, "Sex"),
         e("input", {
           id: "sex01",
           type: "radio",
           name: "sex",
           value: "male",
           checked: newCrew.sex === "male",
           onChange: event => {
             this.setState({newCrew: {
               name: newCrew.name,
               alias: newCrew.alias,
               sex: "male",
               image: newCrew.image
             }});
           }
         }),
         e("label", {htmlFor: "sex01"}, "male"),
         e("input", {
           id: "sex02",
           type: "radio",
           name: "sex",
           value: "female",
           checked: newCrew.sex === "female",
           onChange: event => {
             this.setState({newCrew: {
               name: newCrew.name,
               alias: newCrew.alias,
               sex: "female",
               image: newCrew.image
             }});
           }
         }),
         e("label", {htmlFor: "sex02"}, "female")
       ),
       e("div", {className: "msr_file"},
         e("p", {}, "Image"),
         e("div", {className: "msr_filebox"},
           e("label", {htmlFor: "image"}, "select image"),
           e("input", {
             type: "file",
             id: "image",
             name: "image",
             accept: "image/*",
             value: newCrew.image,
             onChange: event => {
               this.setState({newCrew: {
                 name: newCrew.name,
                 alias: newCrew.alias,
                 sex: newCrew.sex,
                 image: event.target.value
               }});
             }
           })
         )
       ),
       e("p", {className: "msr_sendbtn"},
         e("input", {
           type: "submit",
           value: "submit",
           onClick: () => {this.addCrew(newCrew);}
         })
       )
     );
   }

   render() {
    return e("div", {className: "center"},
      e("h1", {align: "center"}, "Profile List"),
      this.renderSearch(),
      this.renderCrews(),
      this.renderForm()
    );
  }
 }

 ReactDOM.render(e(ProfileManager), document.getElementById("app"));
