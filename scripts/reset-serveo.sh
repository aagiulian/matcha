
MATCHA_API="matcha-api-$(whoami)"
MATCHA_FRONT="matcha-front-$(whoami)"
MATCHA_EMAIL_CHECK="matcha-email-check-$(whoami)"

ssh -o PubkeyAuthentication=no -R $MATCHA_API:80:$(minikube ip):30077 serveo.net 1>> ../logs/graphql.out 2>> ../logs/graphql.err &
ssh -o PubkeyAuthentication=no -R $MATCHA_EMAIL_CHECK:80:$(minikube ip):30078 serveo.net 1>> ../logs/email_check.out 2>> ../logs/email_check.err &
ssh -o PubkeyAuthentication=no -R $MATCHA_FRONT:80:$(minikube ip):30080 serveo.net 1>> ../logs/react.out 2>> ../logs/react.err &