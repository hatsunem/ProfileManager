const e = React.createElement;

 class CrewDetail extends React.Component {
   constructor(props) {
     super(props);
     this.state = {
       newPer: "",
       nerSp: "",
       crew: {crew_id: "", name: "", alias: "", sex: "", image: "", personality: [], specialty: []}
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
     var path = location.pathname
     var id = path.slice(6)
     fetch("/api/crew/" + id, {})
       .then(x => x.json())
       .then(json => {
         if (json === null) {
           return;
         }
         this.setState({crew: json})
       });
   }

   addPersonality(newPer) {
     if (newPer === "" ) {
       return;
     }
     const personality = {
       crew_id: this.state.crew.crew_id,
       personality: newPer
     };
     return fetch("/api/crew/per", {
       credentials: "same-origin",
       method: "POST",
       headers: {
         "Accept": "application/json",
         "Content-Type": "application/json",
         "X-CSRF-Token": this.token
       },
       body: JSON.stringify(personality)
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
         newPer: "",
         newSp: this.state.newSp,
         crew: data
       });
       this.fetchAll()
     })
     .catch(err => {
       console.error("post crew error: ", err);
     });
   }

   addSpecialty(newSp) {
     if (newSp === "" ) {
       return;
     }
     const specialty = {
       crew_id: this.state.crew.crew_id,
       specialty: newSp
     };
     return fetch("/api/crew/sp", {
       credentials: "same-origin",
       method: "POST",
       headers: {
         "Accept": "application/json",
         "Content-Type": "application/json",
         "X-CSRF-Token": this.token
       },
       body: JSON.stringify(specialty)
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
         newPer: this.state.newPer,
         newSp: "",
         crew: data
       });
       this.fetchAll()
     })
     .catch(err => {
       console.error("post crew error: ", err);
     });
   }

   renderDetail() {
     const {crew} = this.state;
     var len = crew.image.length
     var img_file = crew.image
     if (crew.image.indexOf("C:\\fakepath") !== -1) {
       img_file = img_file.substring(12, len)
     }
     var img_src = "/static/images/" + img_file
     var sp;
     var s_count;
     var p_count;
     var per;
     if (crew.specialty === null) {
       // specialtyがない場合
       sp = []
       s_count = 0
     } else {
       sp = crew.specialty.filter(function (x, i, self) {
         return self.indexOf(x) === i;
       })
       s_count = sp.length
     }
     if (crew.personality === null) {
       // personalityがない場合
       per = []
       p_count = 0
     } else {
       per = crew.personality.filter(function (x, i, self) {
         return self.indexOf(x) === i;
       })
       p_count = per.length
     }
     return e("div", {className: "msr_box"},
       e("h3", {className: "ttl"}, crew.alias),
       e("img", {src: img_src, width: "500", height: "500", alt: "img"}),
       e("p", {},
         e("table", {className: "crew_table", rules: "rows"},
           e("tbody", {valign: "top"},
             e("tr", {},
               e("td", {className: "text_bold"}, "Name"),
               e("td", {}, crew.name !== "" ? crew.name:"-")
             ),
             e("tr", {},
               e("td", {className: "text_bold"}, "Sex"),
               e("td", {}, crew.sex)
             ),
             s_count === 0 ? e("tr", {},
                 e("td", {className: "text_bold"}, "Specialty"),
                 e("td", {}, "-")
               ) : sp.map(function(s, idx) {
                 // セルの結合
                 if (idx === 0) {
                   return e("tr", {},
                   e("td", {className: "text_bold", rowSpan: s_count}, "Specialty"),
                   e("td", {}, sp[idx])
                   )
                 }
                 return e("tr", {}, e("td", {}, sp[idx]))
             }),
             p_count === 0 ? e("tr", {},
                 e("td", {className: "text_bold"}, "Personality"),
                 e("td", {}, "-")
               ) : per.map(function(p, idx) {
                 // セルの結合
                 if (idx === 0) {
                   return e("tr", {},
                   e("td", {className: "text_bold", rowSpan: p_count}, "Personality"),
                   e("td", {}, per[idx])
                   )
                 }
                 return e("tr", {}, e("td", {}, per[idx]))
             })
           )
         )
       )
     )
   }

   renderForm() {
     const {newSp} = this.state;
     const {newPer} = this.state;
     return e("div", {className: "center"},
       e("table", {className: "msr_text"},
         e("tr", {},
           e("td", {},
             e("label", {}, "Specialty"),
             e("input", {
               id: "specialty",
               name: "specialty",
               type: "text",
               value: newSp,
               onChange: event => {
                 this.setState({newSp: event.target.value});
               }
             })
           ),
           e("td", {},
             e("p", {className: "msr_sendbtn"},
               e("input", {
                 type: "submit",
                 value: "Add Specialty",
                 onClick: () => {this.addSpecialty(newSp);}
               })
             )
           )
         ),
         e("tr", {},
           e("td", {},
             e("label", {}, "Personality"),
             e("input", {
               id: "personality",
               name: "personality",
               type: "text",
               value: newPer,
               onChange: event => {
                 this.setState({newPer: event.target.value});
               }
             })
           ),
           e("td", {className: "msr_sendbtn"},
             // e("p", {},
               e("input", {
                 type: "submit",
                 value: "Add Personality",
                 onClick: () => {this.addPersonality(newPer);}
               })
             // )
           )
         ),
       ),
     );
   }

   render() {
     return e("div", {},
       this.renderDetail(),
       this.renderForm()
     );
   }
 }

 ReactDOM.render(e(CrewDetail), document.getElementById("app"));
