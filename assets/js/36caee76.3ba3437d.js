"use strict";(self.webpackChunkdocs=self.webpackChunkdocs||[]).push([["871"],{8928:function(e,n,t){t.r(n),t.d(n,{default:()=>h,frontMatter:()=>r,metadata:()=>s,assets:()=>c,toc:()=>d,contentTitle:()=>o});var s=JSON.parse('{"id":"infrastructure/Guides/deploy-a-new-app","title":"Deploy a New App","description":"Introduction","source":"@site/docs/infrastructure/03-Guides/deploy-a-new-app.md","sourceDirName":"infrastructure/03-Guides","slug":"/infrastructure/Guides/deploy-a-new-app","permalink":"/docs/infrastructure/Guides/deploy-a-new-app","draft":false,"unlisted":false,"editUrl":"https://github.com/polinetworkorg/docs/tree/main/docs/infrastructure/03-Guides/deploy-a-new-app.md","tags":[],"version":"current","frontMatter":{"title":"Deploy a New App"},"sidebar":"infra","previous":{"title":"Add a New Secret","permalink":"/docs/infrastructure/Guides/add-a-new-secret"}}'),i=t("6773"),a=t("6070");let r={title:"Deploy a New App"},o=void 0,c={},d=[{value:"Introduction",id:"introduction",level:2},{value:"Procedure",id:"procedure",level:2},{value:"Create the app structure",id:"create-the-app-structure",level:3},{value:"Docker Image Auto-Updater",id:"docker-image-auto-updater",level:2},{value:"Digest with Kustomize",id:"digest-with-kustomize",level:3}];function l(e){let n={a:"a",admonition:"admonition",br:"br",code:"code",em:"em",h2:"h2",h3:"h3",li:"li",ol:"ol",p:"p",pre:"pre",strong:"strong",ul:"ul",...(0,a.a)(),...e.components};return(0,i.jsxs)(i.Fragment,{children:[(0,i.jsx)(n.h2,{id:"introduction",children:"Introduction"}),"\n",(0,i.jsxs)(n.p,{children:["We use k8s to deploy our applications.",(0,i.jsx)(n.br,{}),"\n","You can choose, based on your needs, to use basic k8s manifests, ",(0,i.jsx)(n.a,{href:"https://kustomize.io/",children:"Kustomize"})," or ",(0,i.jsx)(n.a,{href:"https://helm.sh/docs/topics/charts/",children:"Helm Charts"}),"."]}),"\n",(0,i.jsxs)(n.p,{children:["If you have access to PoliNetwork's k8s cluster (you can perform ",(0,i.jsx)(n.code,{children:"kubectl"})," commands) you can directly deploy from your machine.",(0,i.jsx)(n.br,{}),"\n","Although, this is not recommended in a production environment.",(0,i.jsx)(n.br,{}),"\n","Check ",(0,i.jsx)(n.a,{href:"https://minikube.sigs.k8s.io/docs/start/?arch=%2Flinux%2Fx86-64%2Fstable%2Fbinary+download",children:"minikube"})," to install a k8s cluster in your machine for testing purposes."]}),"\n",(0,i.jsxs)(n.admonition,{title:"CD",type:"note",children:[(0,i.jsxs)(n.p,{children:["To deploy our applications, we use ",(0,i.jsx)(n.a,{href:"https://argo-cd.readthedocs.io/en/stable/",children:"ArgoCD"}),"\nwith a ",(0,i.jsx)(n.a,{href:"https://argo-cd.readthedocs.io/en/stable/operator-manual/applicationset/Generators-Git/#git-generator-files",children:"Git File Generator"}),"\npointing to the ",(0,i.jsx)(n.a,{href:"https://github.com/PoliNetworkOrg/polinetwork-cd/",children:"polinetwork-cd"})," GitHub repo."]}),(0,i.jsxs)(n.p,{children:["For more info, check out ",(0,i.jsx)(n.em,{children:"[Getting Started / Basic Knowledge]"})]})]}),"\n",(0,i.jsx)(n.h2,{id:"procedure",children:"Procedure"}),"\n",(0,i.jsxs)(n.ol,{children:["\n",(0,i.jsxs)(n.li,{children:["Deploy a ",(0,i.jsx)(n.a,{href:"https://docs.docker.com/get-started/docker-concepts/the-basics/what-is-an-image/",children:"Docker image"})]}),"\n",(0,i.jsx)(n.li,{children:(0,i.jsx)(n.a,{href:"#create-the-app-structure",children:"Create the app structure"})}),"\n",(0,i.jsx)(n.li,{children:"Open a PR into polinetwork-cd"}),"\n",(0,i.jsx)(n.li,{children:"Monitor deploy on ArgoCD"}),"\n"]}),"\n",(0,i.jsx)(n.h3,{id:"create-the-app-structure",children:"Create the app structure"}),"\n",(0,i.jsx)(n.p,{children:"This is the crucial part, so make sure to follow it step-by-step."}),"\n",(0,i.jsxs)(n.ol,{children:["\n",(0,i.jsxs)(n.li,{children:["Clone ",(0,i.jsx)(n.a,{href:"https://github.com/PoliNetworkOrg/polinetwork-cd",children:"polinetwork-cd"})," repo"]}),"\n",(0,i.jsxs)(n.li,{children:["Create a new branch (named as you like, e.g. ",(0,i.jsx)(n.code,{children:"mc-server-deploy"}),")"]}),"\n",(0,i.jsx)(n.li,{children:"Create this minimal file structure:"}),"\n"]}),"\n",(0,i.jsx)(n.pre,{children:(0,i.jsx)(n.code,{children:"\uD83D\uDDC0 <k8s-namespace>\n\u251C\u2500 \uD83D\uDDC0 src\n\u2502  \u2514\u2500\u2500 deployment.yaml\n\u2502 \n\u2514\u2500 config.json\n"})}),"\n",(0,i.jsxs)(n.admonition,{type:"info",children:[(0,i.jsxs)(n.p,{children:["The ",(0,i.jsx)(n.code,{children:"<k8s-namespace>"})," should be a slug (lowercase words separated by hyphens) identifier of the application/service you want to deploy.",(0,i.jsx)(n.br,{}),"\n","You can append, if necessary, an enviornment tag (e.g. ",(0,i.jsx)(n.code,{children:"app-dev"}),", ",(0,i.jsx)(n.code,{children:"app-prod"}),")."]}),(0,i.jsxs)(n.p,{children:["Make sure that you use the same ",(0,i.jsx)(n.code,{children:"<k8s-namespace>"})," value for both:"]}),(0,i.jsxs)(n.ul,{children:["\n",(0,i.jsx)(n.li,{children:"folder name"}),"\n",(0,i.jsx)(n.li,{children:"namespace field in k8s resources"}),"\n"]})]}),"\n",(0,i.jsxs)(n.p,{children:["Inside ",(0,i.jsx)(n.code,{children:"src/"})," you can put one of the following:"]}),"\n",(0,i.jsxs)(n.ul,{children:["\n",(0,i.jsxs)(n.li,{children:["base k8s manifest (",(0,i.jsx)(n.a,{href:"https://raw.githubusercontent.com/kubernetes/website/main/content/en/examples/controllers/nginx-deployment.yaml",children:"example"}),")"]}),"\n",(0,i.jsx)(n.li,{children:(0,i.jsx)(n.a,{href:"https://kubectl.docs.kubernetes.io/guides/introduction/kustomize/",children:"Kustomize"})}),"\n",(0,i.jsx)(n.li,{children:(0,i.jsx)(n.a,{href:"https://helm.sh/docs/topics/charts/",children:"Helm Chart"})}),"\n"]}),"\n",(0,i.jsxs)(n.p,{children:["How these build tools are detected and distinguished is described ",(0,i.jsx)(n.a,{href:"https://argo-cd.readthedocs.io/en/stable/user-guide/tool_detection/#tool-detection",children:"here"}),"."]}),"\n",(0,i.jsxs)(n.admonition,{type:"important",children:[(0,i.jsx)(n.p,{children:"If you would like to use the Docker Image Auto-Updater, base k8s manifests are not supported, you must choose between Kustomize and Helm Chart."}),(0,i.jsxs)(n.p,{children:["For more info, check the ",(0,i.jsx)(n.a,{href:"#docker-image-auto-updater",children:"relative section"}),"."]})]}),"\n",(0,i.jsx)(n.h2,{id:"docker-image-auto-updater",children:"Docker Image Auto-Updater"}),"\n",(0,i.jsxs)(n.p,{children:["We use ",(0,i.jsx)(n.a,{href:"https://argocd-image-updater.readthedocs.io/en/stable/",children:"ArgoCD Image Updater"})," to\nautomatically update docker images in deployments.",(0,i.jsx)(n.br,{}),"\n","This is an optional feature, but the alternative is to use a docker image fixed version (e.g. ",(0,i.jsx)(n.code,{children:"nginx:1.27.4"}),")."]}),"\n",(0,i.jsxs)(n.p,{children:["We use the ",(0,i.jsx)(n.code,{children:"digest"})," strategy by default (also the only one we documented so far).",(0,i.jsx)(n.br,{}),"\n","Check out ",(0,i.jsx)(n.a,{href:"https://argocd-image-updater.readthedocs.io/en/stable/basics/update-strategies/",children:"the other strategies available"}),"."]}),"\n",(0,i.jsxs)(n.p,{children:["As mentioned in the ",(0,i.jsx)(n.a,{href:"#create-the-app-structure",children:"section above"}),", you must use Kustomize or Helm Charts."]}),"\n",(0,i.jsxs)(n.admonition,{type:"warning",children:[(0,i.jsx)(n.p,{children:"Consider the following manifest:"}),(0,i.jsx)(n.pre,{children:(0,i.jsx)(n.code,{className:"language-yaml",children:"kind: Pod\napiVersion: v1\nmetadata:\n  name: example-pod\n  namespace: test\nspec:\n  containers:\n    - name: nginx\n      image: nginx:latest\n"})}),(0,i.jsxs)(n.p,{children:["the image would ",(0,i.jsx)(n.strong,{children:"not update"})," if you ",(0,i.jsx)(n.strong,{children:"don't follow"})," this guide, even though there is ",(0,i.jsx)(n.code,{children:"latest"}),"."]})]}),"\n",(0,i.jsx)(n.h3,{id:"digest-with-kustomize",children:"Digest with Kustomize"}),"\n",(0,i.jsxs)(n.ul,{children:["\n",(0,i.jsx)(n.li,{children:(0,i.jsx)(n.a,{href:"https://github.com/PoliNetworkOrg/polinetwork-cd/tree/main/tests/docker-test",children:"Full example"})}),"\n"]}),"\n",(0,i.jsxs)(n.p,{children:["In this configuration, we are using a Kustomize deployment with ",(0,i.jsx)(n.code,{children:"digest"})," strategy.",(0,i.jsx)(n.br,{}),"\n","These are the steps to follow: (we are using ",(0,i.jsx)(n.code,{children:"toto04/testcontainer"})," as the docker image)"]}),"\n",(0,i.jsxs)(n.ol,{children:["\n",(0,i.jsxs)(n.li,{children:["Create a ",(0,i.jsx)(n.code,{children:"src/kustomization.yaml"})," with this content:"]}),"\n"]}),"\n",(0,i.jsx)(n.pre,{children:(0,i.jsx)(n.code,{className:"language-yaml",children:"apiVersion: kustomize.config.k8s.io/v1beta1\nkind: Kustomization\n\nresources:\n- deployment.yaml\n"})}),"\n",(0,i.jsxs)(n.ol,{start:"2",children:["\n",(0,i.jsxs)(n.li,{children:["As declared in the ",(0,i.jsx)(n.code,{children:"resources"})," field above, we need a k8s manifest ",(0,i.jsx)(n.code,{children:"src/deployment.yaml"}),".",(0,i.jsx)(n.br,{}),"\n","Create it and set the ",(0,i.jsx)(n.code,{children:"spec.containers[x].image"})," field as a fixed digest, example:"]}),"\n"]}),"\n",(0,i.jsx)(n.pre,{children:(0,i.jsx)(n.code,{className:"language-yaml",children:"spec:\n  containers:\n  - name: docker-test-pod\n    image: toto04/testcontainer@sha256:b5ec2efcc11e90c2fd955cd1c01f3fdf7c2f18c77c213360addcd37be7e8f2f3\n"})}),"\n",(0,i.jsx)(n.admonition,{type:"tip",children:(0,i.jsxs)(n.p,{children:["If you are using Docker Hub, you can find a digest going to the image homepage (",(0,i.jsx)(n.a,{href:"https://hub.docker.com/r/toto04/testcontainer/tags",children:"example"}),")\nunder the tag you want to use (e.g. ",(0,i.jsx)(n.code,{children:"latest"}),")"]})}),"\n",(0,i.jsxs)(n.ol,{start:"3",children:["\n",(0,i.jsxs)(n.li,{children:["In the ",(0,i.jsx)(n.code,{children:"config.json"})," file set the image(s) to automatically update:"]}),"\n"]}),"\n",(0,i.jsx)(n.pre,{children:(0,i.jsx)(n.code,{className:"language-yaml",children:'  "image": {\n    "image_list": "toto04/testcontainer:latest",\n    "update_strategy": "digest"\n  }\n'})}),"\n",(0,i.jsxs)(n.p,{children:["In this configuration, the image ",(0,i.jsx)(n.code,{children:"toto04/testcontainer"})," would be automatically updated following the tag ",(0,i.jsx)(n.code,{children:"latest"}),"."]}),"\n",(0,i.jsxs)(n.admonition,{type:"tip",children:[(0,i.jsx)(n.p,{children:"You can also specify multiple images to update:"}),(0,i.jsx)(n.pre,{children:(0,i.jsx)(n.code,{className:"language-yaml",metastring:'title="config.json"',children:'  "image": {\n# add-highlight-start\n    "image_list": "x/image1:latest x/image2:latest",\n# add-highlight-end\n    "update_strategy": "digest"\n  }\n'})}),(0,i.jsx)(n.pre,{children:(0,i.jsx)(n.code,{className:"language-yaml",metastring:'title="src/deployment.yaml"',children:"apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: deploy-1\n  namespace: <k8s-namespace>\nspec:\n  replicas: 1\n  selector:\n    matchLabels:\n      app: app-1\n  template:\n    metadata:\n      labels:\n        app: app-1\n    spec:\n      containers:\n      - name: app-1-pod\n# add-highlight-start\n        image: x/image1@sha256:xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx\n# add-highlight-end\n---\napiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: deploy-2\n  namespace: <k8s-namespace>\nspec:\n  replicas: 2\n  selector:\n    matchLabels:\n      app: app-2\n  template:\n    metadata:\n      labels:\n        app: app-2\n    spec:\n      containers:\n      - name: app-2-pod\n# add-highlight-start\n        image: x/image2@sha256:xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx\n# add-highlight-end\n"})})]})]})}function h(e={}){let{wrapper:n}={...(0,a.a)(),...e.components};return n?(0,i.jsx)(n,{...e,children:(0,i.jsx)(l,{...e})}):l(e)}},6070:function(e,n,t){t.d(n,{Z:function(){return o},a:function(){return r}});var s=t(1699);let i={},a=s.createContext(i);function r(e){let n=s.useContext(a);return s.useMemo(function(){return"function"==typeof e?e(n):{...n,...e}},[n,e])}function o(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(i):e.components||i:r(e.components),s.createElement(a.Provider,{value:n},e.children)}}}]);