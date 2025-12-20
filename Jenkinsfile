pipeline {
  agent any

//   tools {
//     nodejs = 'NodeJS_16'
//   }
    tools {
    sonarScanner 'sonar-scanner'
    }
  environment {
    REGISTRY = "docker.io"
    DOCKER_REPO = "kishor95"
    BACKEND_IMAGE = "vote-backend"
    FRONTEND_IMAGE = "vote-frontend"
    IMAGE_TAG = "${BUILD_NUMBER}"
    scannerHome = tool 'sonar-scanner'

  }

  stages {

    stage('Clean Workspace') {
      steps {
        cleanWs()
      }
    }

    stage('Checkout Code') {
      steps {
        git branch: 'main',
            credentialsId: 'github-token',
            url: 'https://github.com/kishor-95/three-tier-voting-app'
      }
    }

    stage('Backend Lint & Build') {
      steps {
        dir('backend') {
          sh '''
            npm ci
            npm run lint
          '''
        }
      }
    }

    stage('Backend Filesystem Scan') {
      steps {
        dir('backend') {
          sh 'trivy fs .'
        }
      }
    }

    stage('Frontend Lint & Build') {
      steps {
        dir('frontend') {
          sh '''
            npm ci
            npm run build
          '''
        }
      }
    }

    stage('Frontend Filesystem Scan') {
      steps {
        dir('frontend') {
          sh 'trivy fs .'
        }
      }
    }

    stage('SonarQube Backend Scan') {
      steps {
        dir('backend') {
          withSonarQubeEnv('sonar') {
            sh """
              ${scannerHome}/bin/sonar-scanner \
              -Dsonar.projectKey=three-tier-voting-backend \
              -Dsonar.sources=.
            """
          }
        }
      }
    }

    stage('SonarQube Frontend Scan') {
      steps {
        dir('frontend') {
          withSonarQubeEnv('sonar') {
            sh """
             ${scannerHome}/bin/sonar-scanner \
              -Dsonar.projectKey=three-tier-voting-frontend \
              -Dsonar.sources=.
            """
          }
        }
      }
    }

    stage('Quality Gate') {
      steps {
        waitForQualityGate abortPipeline: false
      }
    }

    stage('Docker Login') {
      steps {
        withCredentials([usernamePassword(
        credentialsId: 'docker',
        usernameVariable: 'DOCKER_USER',
        passwordVariable: 'DOCKER_PASS'
        )]) {
            sh '''
            echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin
            '''
        }
      }
    }

    stage('Build Docker Images') {
      steps {
        sh """
        docker build -t ${DOCKER_REPO}/${BACKEND_IMAGE}:${IMAGE_TAG} ./backend
        docker build -t ${DOCKER_REPO}/${FRONTEND_IMAGE}:${IMAGE_TAG} ./frontend
        """
        }
    }

    stage('Scan Docker Images') {
      steps {
        sh """
        trivy image --severity HIGH,CRITICAL --exit-code 1 \
        ${DOCKER_REPO}/${BACKEND_IMAGE}:${IMAGE_TAG}

        trivy image --severity HIGH,CRITICAL --exit-code 1 \
        ${DOCKER_REPO}/${FRONTEND_IMAGE}:${IMAGE_TAG}
        """
      }
    }

    stage('Push Docker Images') {
      steps {
        withCredentials([usernamePassword(
          credentialsId: 'docker',
          usernameVariable: 'DOCKER_USER',
          passwordVariable: 'DOCKER_PASS'
        )]) {
        sh '''
        echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin

        docker push ${DOCKER_REPO}/${BACKEND_IMAGE}:${IMAGE_TAG}
        docker push ${DOCKER_REPO}/${FRONTEND_IMAGE}:${IMAGE_TAG}

        docker logout
      '''
       }
      } 
    }


    stage('Update Kubernetes Manifests (GitOps)') {
      steps {
        sh """
          git checkout ci-cd

          sed -i 's|image: .*vote-backend.*|image: ${DOCKER_REPO}/${BACKEND_IMAGE}:${IMAGE_TAG}|' kubernetes/backend/backend-deployment.yaml
          sed -i 's|image: .*vote-frontend.*|image: ${DOCKER_REPO}/${FRONTEND_IMAGE}:${IMAGE_TAG}|' kubernetes/frontend/frontend-deployment.yaml

          git config user.name "jenkins-bot"
          git config user.email "jenkins@ci.local"

          git commit -am "ci: update images to ${IMAGE_TAG}"
          git push origin ci-cd
        """
      }
    }
  }

  post {
    success {
      echo "✅ CI complete. Create PR from ci-cd → main. Argo CD will deploy."
    }
    failure {
      echo "❌ Pipeline failed. Fix issues before retry."
    }
  }
}




///
new working copy
///

pipeline {
  agent any

  environment {
    REGISTRY = "docker.io"
    DOCKER_REPO = "kishor95"
    BACKEND_IMAGE = "vote-backend"
    FRONTEND_IMAGE = "vote-frontend"
    IMAGE_TAG = "${BUILD_NUMBER}"
    SCANNER_HOME = tool 'sonar-scanner'

  }

  stages {

    stage('Clean Workspace') {
      steps {
        cleanWs()
      }
    }

    stage('Checkout Code') {
      steps {
        git branch: 'main',
            credentialsId: 'github-token',
            url: 'https://github.com/kishor-95/three-tier-voting-app'
      }
    }

    stage('Backend Lint & Build') {
      steps {
        dir('backend') {
          sh '''
            npm ci
            npm run lint
          '''
        }
      }
    }

    stage('Backend Filesystem Scan') {
      steps {
        dir('backend') {
          sh 'trivy fs .'
        }
      }
    }

    stage('Frontend Lint & Build') {
      steps {
        dir('frontend') {
          sh '''
            npm ci
            npm run build
          '''
        }
      }
    }

    stage('Frontend Filesystem Scan') {
      steps {
        dir('frontend') {
          sh 'trivy fs .'
        }
      }
    }

    stage('SonarQube Backend Scan') {
      steps {
        dir('backend') {
          withSonarQubeEnv('lil_sonar_project') {
            sh """
              ${scannerHome}/bin/sonar-scanner \
              -Dsonar.projectKey=three-tier-voting-backend \
              -Dsonar.sources=.
            """
          }
        }
      }
    }

    stage('SonarQube Frontend Scan') {
      steps {
        dir('frontend') {
          withSonarQubeEnv('lil_sonar_project') {
            sh """
              ${scannerHome}/bin/sonar-scanner \
              -Dsonar.projectKey=three-tier-voting-frontend \
              -Dsonar.sources=.
            """
          }
        }
      }
    }

    stage('Quality Gate') {
      steps {
        waitForQualityGate abortPipeline: false
      }
    }

    stage('Docker Login') {
      steps {
        withCredentials([usernamePassword(
        credentialsId: 'docker',
        usernameVariable: 'DOCKER_USER',
        passwordVariable: 'DOCKER_PASS'
        )]) {
            sh '''
            echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin
            '''
        }
      }
    }

    stage('Build Docker Images') {
      steps {
        sh """
        docker build -t ${DOCKER_REPO}/${BACKEND_IMAGE}:${IMAGE_TAG} ./backend
        docker build -t ${DOCKER_REPO}/${FRONTEND_IMAGE}:${IMAGE_TAG} ./frontend
        """
        }
    }

    stage('Scan Docker Images') {
      steps {
        sh """
        trivy image --severity HIGH,CRITICAL --exit-code 1 \
        ${DOCKER_REPO}/${BACKEND_IMAGE}:${IMAGE_TAG}

        trivy image --severity HIGH,CRITICAL --exit-code 1 \
        ${DOCKER_REPO}/${FRONTEND_IMAGE}:${IMAGE_TAG}
        """
      }
    }

    stage('Push Docker Images') {
      steps {
        withCredentials([usernamePassword(
          credentialsId: 'docker',
          usernameVariable: 'DOCKER_USER',
          passwordVariable: 'DOCKER_PASS'
        )]) {
        sh '''
        echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin

        docker push ${DOCKER_REPO}/${BACKEND_IMAGE}:${IMAGE_TAG}
        docker push ${DOCKER_REPO}/${FRONTEND_IMAGE}:${IMAGE_TAG}

        docker logout
      '''
       }
      } 
    }


    stage('Update Kubernetes Manifests (GitOps)') {
      steps {
        sh """
          git checkout ci-cd

          sed -i 's|image: .*vote-backend.*|image: ${DOCKER_REPO}/${BACKEND_IMAGE}:${IMAGE_TAG}|' kubernetes/backend/backend-deployment.yaml
          sed -i 's|image: .*vote-frontend.*|image: ${DOCKER_REPO}/${FRONTEND_IMAGE}:${IMAGE_TAG}|' kubernetes/frontend/frontend-deployment.yaml

          git config user.name "jenkins-bot"
          git config user.email "jenkins@ci.local"

          git commit -am "ci: update images to ${IMAGE_TAG}"
          git push origin ci-cd
        """
      }
    }
  }

  post {
    success {
      echo "✅ CI complete. Create PR from ci-cd → main. Argo CD will deploy."
    }
    failure {
      echo "❌ Pipeline failed. Fix issues before retry."
    }
  }
}
