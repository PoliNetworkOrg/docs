import{i as e}from"./rolldown-runtime-Dd_uD5pT.js";import{t}from"./jsx-runtime-DREnUpxT.js";var n=e(t()),r={title:`TabelleCalendar`},i=`\`\`\`mermaid
classDiagram

class Day {
  Date  giorno PK
}

class Tipologia{
int id_tipologia PK,	
ENUM name_ 
}

class appartiene{
int giorno FK,
int id_tipologia FK
}

class lesson{
int  id_lesson PK,	
VARCHAR name_,
VARCHAR aula,
TIME orarioInizio,
TIME orarioFine,
VARCHAR professore
}

class Presente{
int giorno FK,
int id_lesson FK
}

class Exam{
int id_exam PK,	
VARCHAR name_,
VARCHAR sede,
int semestre,
VARCHAR docente,
datetime data,
int giorno FK
}

appartiene<|--Day
Tipologia<|--appartiene

Presente<|--Day
lesson<|--Presente

Exam<|--Day


\`\`\`
`,a={contents:[],headings:[]},o=[];function s(e){let{Mermaid:t}=e.components||{};return t||l(`Mermaid`,!0),(0,n.jsx)(t,{chart:`classDiagram

class Day {
  Date  giorno PK
}

class Tipologia{
int id_tipologia PK,	
ENUM name_ 
}

class appartiene{
int giorno FK,
int id_tipologia FK
}

class lesson{
int  id_lesson PK,	
VARCHAR name_,
VARCHAR aula,
TIME orarioInizio,
TIME orarioFine,
VARCHAR professore
}

class Presente{
int giorno FK,
int id_lesson FK
}

class Exam{
int id_exam PK,	
VARCHAR name_,
VARCHAR sede,
int semestre,
VARCHAR docente,
datetime data,
int giorno FK
}

appartiene<|--Day
Tipologia<|--appartiene

Presente<|--Day
lesson<|--Presente

Exam<|--Day`})}function c(e={}){let{wrapper:t}=e.components||{};return t?(0,n.jsx)(t,{...e,children:(0,n.jsx)(s,{...e})}):s(e)}function l(e,t){throw Error(`Expected `+(t?`component`:`object`)+" `"+e+"` to be defined: you likely forgot to import, pass, or provide it.")}export{i as _markdown,c as default,r as frontmatter,a as structuredData,o as toc};