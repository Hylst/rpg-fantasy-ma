# 🔧 Guide de Dépannage - Problèmes de Push GitHub

## 🚨 Diagnostic Rapide

### Étape 1 : Vérification de Base

Ouvrez PowerShell ou CMD dans votre dossier projet et exécutez :

```bash
# Naviguez vers votre projet
cd "d:\0CODE\MANUSAI\RPG_AI\Web App de Jeu de Rôle Fantasy"

# Vérifiez l'état Git
git status

# Vérifiez les remotes
git remote -v

# Vérifiez votre branche actuelle
git branch
```

---

## 🔍 Solutions par Type d'Erreur

### ❌ Erreur : "fatal: not a git repository"

**Cause** : Git n'est pas initialisé dans ce dossier

**Solution** :
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
```

---

### ❌ Erreur : "fatal: 'origin' does not appear to be a git repository"

**Cause** : Le repository distant n'est pas configuré

**Solution** :
```bash
# Remplacez par l'URL de VOTRE repository GitHub
git remote add origin https://github.com/VOTRE_USERNAME/VOTRE_REPO.git

# Vérifiez que c'est ajouté
git remote -v

# Puis poussez
git push -u origin main
```

---

### ❌ Erreur : "Authentication failed" ou "Permission denied"

**Cause** : Problème d'authentification GitHub

**Solution 1 - Token Personnel (Recommandé)** :

1. **Allez sur GitHub.com**
2. **Cliquez sur votre photo de profil > Settings**
3. **Developer settings > Personal access tokens > Tokens (classic)**
4. **Generate new token (classic)**
5. **Cochez "repo" dans les permissions**
6. **Copiez le token généré**
7. **Utilisez-le comme mot de passe lors du push**

```bash
# Quand Git demande le mot de passe, collez votre token
git push -u origin main
```

**Solution 2 - Configuration Git Credential Manager** :
```bash
# Configurez Git pour utiliser le credential manager
git config --global credential.helper manager-core

# Puis tentez le push
git push -u origin main
```

---

### ❌ Erreur : "Updates were rejected because the remote contains work"

**Cause** : Le repository distant a des commits que vous n'avez pas localement

**Solution** :
```bash
# Option 1 : Pull puis push (recommandé)
git pull origin main --allow-unrelated-histories
git push -u origin main

# Option 2 : Force push (ATTENTION : écrase l'historique distant)
git push -u origin main --force
```

---

### ❌ Erreur : "Filename too long" (Windows)

**Cause** : Chemins de fichiers trop longs sur Windows

**Solution** :
```bash
# Activez le support des chemins longs
git config --system core.longpaths true

# Ou globalement pour votre utilisateur
git config --global core.longpaths true
```

---

### ❌ Erreur : "File too large" ou "Pack size exceeded"

**Cause** : Fichiers trop volumineux pour GitHub

**Solution** :
```bash
# Vérifiez les gros fichiers
dir /s | sort /r

# Ajoutez les gros fichiers au .gitignore
echo "*.db" >> .gitignore
echo "*.log" >> .gitignore
echo "node_modules/" >> .gitignore
echo "dist/" >> .gitignore
echo "*.pdf" >> .gitignore

# Supprimez-les du cache Git
git rm --cached "nom-du-gros-fichier"

# Recommitez
git add .
git commit -m "Remove large files and update gitignore"
git push -u origin main
```

---

### ❌ Erreur : "Branch 'master' set up to track remote branch 'main'"

**Cause** : Conflit entre les noms de branches master/main

**Solution** :
```bash
# Renommez votre branche locale en main
git branch -M main

# Puis poussez
git push -u origin main
```

---

## 🔄 Procédure de Reset Complet

### Si Rien ne Fonctionne - Reset Total

**⚠️ ATTENTION : Cette procédure efface l'historique Git local**

```bash
# 1. Sauvegardez vos fichiers importants ailleurs

# 2. Supprimez le dossier .git
rmdir /s .git

# 3. Réinitialisez Git
git init

# 4. Configurez votre identité
git config user.name "Votre Nom"
git config user.email "votre.email@example.com"

# 5. Ajoutez tous les fichiers
git add .

# 6. Créez le commit initial
git commit -m "Initial commit: RPG Fantasy Web App"

# 7. Créez la branche main
git branch -M main

# 8. Ajoutez le remote
git remote add origin https://github.com/VOTRE_USERNAME/VOTRE_REPO.git

# 9. Poussez (force si nécessaire)
git push -u origin main --force
```

---

## 🛠️ Outils de Diagnostic

### Commandes de Debug Utiles

```bash
# Informations détaillées sur Git
git config --list
git remote show origin
git log --oneline -10

# Vérification de la connectivité
ping github.com
nslookup github.com

# Test de connexion SSH (si vous utilisez SSH)
ssh -T git@github.com
```

### Vérification des Fichiers Problématiques

```bash
# Fichiers non trackés
git ls-files --others --exclude-standard

# Fichiers modifiés
git diff --name-only

# Taille des fichiers
dir /s | findstr /r "[0-9][0-9][0-9][0-9][0-9][0-9]"
```

---

## 📋 Checklist de Vérification

### Avant de Pousser

- [ ] ✅ Git est initialisé (`git status` fonctionne)
- [ ] ✅ Remote origin est configuré (`git remote -v`)
- [ ] ✅ Vous êtes sur la branche main (`git branch`)
- [ ] ✅ Tous les fichiers sont ajoutés (`git add .`)
- [ ] ✅ Commit créé (`git commit -m "message"`)
- [ ] ✅ Pas de fichiers trop volumineux (< 100MB)
- [ ] ✅ .gitignore configuré correctement

### Après un Push Réussi

- [ ] ✅ Vérifiez sur GitHub.com que les fichiers sont bien là
- [ ] ✅ Vérifiez que le workflow GitHub Actions se déclenche
- [ ] ✅ Notez l'URL de votre repository pour Railway

---

## 🆘 Cas d'Urgence

### Si Vous Êtes Complètement Bloqué

1. **Créez un nouveau repository sur GitHub**
2. **Téléchargez votre projet en ZIP**
3. **Créez un nouveau dossier**
4. **Décompressez le ZIP dans le nouveau dossier**
5. **Suivez la procédure de reset complet ci-dessus**

### Commandes d'Urgence

```bash
# Annuler le dernier commit (garde les fichiers)
git reset --soft HEAD~1

# Annuler tous les changements non commitées
git checkout -- .

# Voir ce qui va être poussé
git diff origin/main..HEAD

# Pousser une branche spécifique
git push origin nom-de-branche
```

---

## 📞 Ressources d'Aide

### Documentation Officielle
- [GitHub Docs - Troubleshooting](https://docs.github.com/en/repositories/creating-and-managing-repositories/troubleshooting-cloning-errors)
- [Git Documentation](https://git-scm.com/doc)

### Commandes de Base Git
```bash
git help                    # Aide générale
git help push              # Aide spécifique à une commande
git --version              # Version de Git installée
```

### Vérification de l'Installation
```bash
# Vérifiez que Git est installé
git --version

# Si Git n'est pas installé, téléchargez-le :
# https://git-scm.com/download/win
```

---

## ✅ Test Final

Une fois le push réussi, testez :

```bash
# Clonez votre repo dans un autre dossier pour tester
git clone https://github.com/VOTRE_USERNAME/VOTRE_REPO.git test-clone
cd test-clone
dir
```

Si vous voyez tous vos fichiers, félicitations ! 🎉 Votre push a réussi !

---

**💡 Conseil** : Sauvegardez ce guide et gardez-le à portée de main pour vos fut