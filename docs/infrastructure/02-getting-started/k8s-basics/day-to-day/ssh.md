## SSH
Normally you shouldn't SSH into a pod to execute repetitive commands, instead you should configure them in the Dockerfile of your application.
To connect into a pod's terminal you can use the `kubectl exec` command like so
```
kubectl exec -n :pod-namespace: :pod-name: -it -- /bin/bash
```
this will open a bash terminal inside the pod. <br/>
Mind there is no `screen` installed by default but you can use `nohup`