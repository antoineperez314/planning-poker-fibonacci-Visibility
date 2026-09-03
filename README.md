# Poker Planning

Application web de Planning Poker Agile / Fibonacci Poker en temps reel.

## Stack

- Next.js
- React
- TypeScript strict
- Tailwind CSS
- Socket.io pour le temps reel
- qrcode.react et lucide-react pour l'interface

## Lancer le projet

```bash
cd "C:\xampp\htdocs\PROJET\Planning Poker Fibonacci\planning-poker-fibonacci-app"
npm run dev
```

Puis ouvrir :

```text
http://localhost:3000
```

## Commandes utiles

```bash
npm run lint
npm run build
npm run dev
```

## Deploiement temps reel

Le frontend peut rester sur Netlify, mais Socket.io doit tourner sur un serveur Node.js persistant comme Render.

### Render

- Build command: `npm install && npm run build`
- Start command: `node server.js`
- Health check path: `/health`
- Variable d'environnement:

```text
CLIENT_ORIGIN=https://taupe-biscotti-7f6252.netlify.app
```

### Netlify

Ajouter l'URL Render dans les variables d'environnement:

```text
NEXT_PUBLIC_SOCKET_URL=https://ton-service-render.onrender.com
```

Puis redeployer Netlify pour que le frontend utilise le serveur Socket.io distant.

## Fonctionnalites V1

- Page d'accueil corporate moderne inspiree telecom/digital.
- Creation de session avec nom, Scrum Master et selection des cartes Fibonacci.
- Generation automatique d'un code court de type `BT-4821`.
- Rejoindre une session avec code et pseudo.
- Salle multijoueur temps reel via Socket.io.
- Roles distincts : animateur et participant.
- Vote cache avant revelation.
- Changement de vote autorise avant revelation.
- Revelation reservee a l'animateur.
- Animation de flip sur les cartes participants.
- Moyenne, mediane, minimum, maximum et distribution des votes.
- Detection visuelle des estimations eloignees.
- Message automatique de convergence ou dispersion.
- Nouvelle estimation avec conservation des participants.
- Gestion de User Stories : titre, description, reference Jira, navigation precedent/suivant.
- Estimation finale retenue par l'animateur.
- Historique de session.
- Export CSV de l'historique.
- QR code et bouton copier le lien.
- Dark mode, sons legers activables/desactivables.
- Donnees de demonstration : session `Refinement LYNX`, code `BT-4821`, story `LYNX-2431`.

## Architecture

```text
src/
  app/
    globals.css
    layout.tsx
    page.tsx
  components/
    ParticipantsPanel.tsx
    PokerCard.tsx
    ResultsPanel.tsx
    ui.tsx
  hooks/
    usePlanningSocket.ts
  lib/
    constants.ts
    csv.ts
    stats.ts
  types/
    planning.ts
server.js
```

## Notes

Cette V1 stocke les sessions en memoire dans le serveur Node.js. C'est volontaire pour permettre une session sans compte et rapidement utilisable. Pour une V2 avec persistance durable, l'etape naturelle serait d'ajouter Supabase ou PostgreSQL.
