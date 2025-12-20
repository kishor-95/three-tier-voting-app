pipeline {
  agent any

  environment {
    REGISTRY = "docker.io"
    DOCKER_REPO = "kishor95"
    BACKEND_IMAGE = "vote-app-backend"
    FRONTEND_IMAGE = "vote-app-frontend"
    IMAGE_TAG = "${BUILD_NUMBER}"
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
            credentialsId: 'github-token',            // GitHub token stored in Jenkins for accessing the repo and pushing changes
            url: 'https://github.com/kishor-95/three-tier-voting-app'
      }
    }

    stage('Init Tools') {
      steps {
        script {
          env.SCANNER_HOME = tool 'lil_sonar_project'           // SonarQube Scanner installed in Jenkins
        }
      }
    }

    stage('Backend Lint') {
      steps {
        dir('backend') {
          sh '''
            npm ci
            npm run lint
          '''
        }
      }
    }

    stage('Frontend Build') {
      steps {
        dir('frontend') {
          sh '''
            npm ci
            npm run build
          '''
        }
      }
    }

    stage('Trivy Filesystem Scan (Full Repo)') {
      steps {
        sh '''
          trivy fs . \
            --severity HIGH,CRITICAL \
            --format json \
            --output trivy-fs-report.json
        '''
      }
      post {
        always {
          archiveArtifacts artifacts: 'trivy-fs-report.json', fingerprint: true
        }
      }
    }

    stage('SonarQube Backend Scan') {
      steps {
        dir('backend') {
          withSonarQubeEnv('lil_sonar_project') {
            sh """
              ${SCANNER_HOME}/bin/sonar-scanner \
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
              ${SCANNER_HOME}/bin/sonar-scanner \
              -Dsonar.projectKey=three-tier-voting-frontend \
              -Dsonar.sources=.
            """
          }
        }
      }
    }

    stage('Quality Gate') {
      steps {
        timeout(time: 10, unit: 'MINUTES') {
          waitForQualityGate abortPipeline: true
        }
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
          trivy image --severity HIGH,CRITICAL \
            ${DOCKER_REPO}/${BACKEND_IMAGE}:${IMAGE_TAG}

          trivy image --severity HIGH,CRITICAL \
            ${DOCKER_REPO}/${FRONTEND_IMAGE}:${IMAGE_TAG}
        """
      }
    }

    stage('Push Docker Images') {
      steps {
        sh """
          docker push ${DOCKER_REPO}/${BACKEND_IMAGE}:${IMAGE_TAG}
          docker push ${DOCKER_REPO}/${FRONTEND_IMAGE}:${IMAGE_TAG}
          docker logout
        """
      }
    }

    stage('Update Kubernetes Manifests (GitOps)') {
      steps {
        withCredentials([usernamePassword(
        credentialsId: 'github-token',
        usernameVariable: 'GIT_USER',
        passwordVariable: 'GIT_TOKEN'
      )]) {
        sh '''
          git checkout ci-cd

          sed -i "s|image: .*vote-app-backend.*|image: ${DOCKER_REPO}/${BACKEND_IMAGE}:${IMAGE_TAG}|" kubernetes/backend/backend-deployment.yaml
          sed -i "s|image: .*vote-app-frontend.*|image: ${DOCKER_REPO}/${FRONTEND_IMAGE}:${IMAGE_TAG}|" kubernetes/frontend/frontend-deployment.yaml
          git config user.name "kishor-95"
          git config user.email "bhairatkishor02@gmail.com"

          git config --global credential.helper store
          echo "https://${GIT_USER}:${GIT_TOKEN}@github.com" > ~/.git-credentials

          git add kubernetes/backend/backend-deployment.yaml kubernetes/frontend/frontend-deployment.yaml
          git commit -m "ci: update images to ${IMAGE_TAG}" || echo "No changes"
          git push origin ci-cd
        '''
        }
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
