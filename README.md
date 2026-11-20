# Aquavéa — boutique du pommeau de douche filtrant

Une landing page produit en HTML, CSS et JS sans dépendance. Pour la voir, ouvrez `index.html`.
Tous les réglages se font dans l'objet `CONFIG` en haut de `script.js` : prix, offres, abonnement, régions, calculateur, avis et lien de paiement.

## Le produit à sourcer (AliExpress)

Recherches à lancer sur AliExpress :
- Pommeau et filtre : [vitamin c filter shower head](https://www.aliexpress.com/w/wholesale-vitamin-c-filter-shower-head.html), [high pressure shower head filter](https://www.aliexpress.com/w/wholesale-high-pressure-shower-head-filter.html)
- Cartouches de rechange : « 15 stage shower filter cartridge » (environ 3 € l'unité)
- Bandelettes : « water hardness test strips »
- Flexible : « stainless steel shower hose 1.5m »

**Critères pour choisir le fournisseur**, à vérifier sur la fiche et sur un échantillon :
1. Le média filtrant est indiqué : PP, charbon actif, **KDF-55**, résine, vitamine C, sulfite de calcium.
2. **Les cartouches de rechange sont vendues par le même vendeur**, même référence. C'est indispensable pour l'abonnement.
3. Le raccord est **G1/2"**, le standard en Belgique et en France.
4. Le bouton stop et les 3 jets sont présents. Le **débit en L/min** est annoncé (à reporter dans `CONFIG.calc.flowUs`).
5. Il y a plus de 1 000 ventes, une note de 4,7 ou plus, des avis récents avec photos, et une livraison UE ou depuis un entrepôt UE.
6. **Commandez 2 ou 3 échantillons** et testez-les vous-même : pression, fuites, odeur de chlore avec et sans filtre.

### Le kit (offre « Kit Complet », 49,90 €)
| Élément | Coût estimé |
|---|---|
| Pommeau haute pression + cartouche montée | 6–12 € |
| 2 cartouches de rechange | 4–8 € |
| Flexible inox 1,5 m | 2–4 € |
| Bandelettes de dureté | 0,5–1 € |
| Ruban téflon + joints + guide imprimé | < 1 € |

Ce sont des coûts indicatifs, hors livraison et emballage : vérifiez-les chez votre fournisseur.
L'abonnement cartouches est à 9,90 € tous les 3 mois, pour un coût d'environ 3 € : c'est lui qui fait la marge sur la durée.
Pour le gérer : Shopify avec une app d'abonnement (Recharge, Seal, Appstle…), ou Stripe Billing.

## Avant la mise en ligne (obligatoire)
- **Avis** : la section reste masquée tant que `CONFIG.reviews` est vide. N'y mettez **que de vrais avis**, car les faux avis sont interdits dans l'UE (directive Omnibus).
- **Prix barré** : il est calculé comme la somme des prix à l'unité (`CONFIG.unit`). Ces prix unitaires doivent être réellement pratiqués sur le site.
- **Compte à rebours** : `CONFIG.promoEnd` doit correspondre à une vraie fin d'offre.
- **Allégations** : restez sur « réduit le chlore » et « limite le calcaire ». Pas de promesse médicale, et ne dites pas « élimine 100 % du calcaire » (c'est faux pour un filtre de douche).
- **Calculateur** : mettez le débit réel du pommeau dans `CONFIG.calc.flowUs`.
- Les visuels (`assets/pommeau.svg`, `douche.svg`, `kit.svg`, `coupe.svg`) sont des illustrations. Remplacez-les par vos vraies photos dès réception des échantillons, en gardant les mêmes noms ou en changeant les chemins dans `index.html`. La simulation de douche dessine l'eau par-dessus `douche.svg` : si vous remplacez cette image, ajustez la position du pommeau dans `SCENE.head` (`script.js`).
- La simulation et l'avant / après sont des illustrations : gardez la mention « illustratif » et ne présentez pas ces rendus comme des photos réelles.
- Renseignez `CONFIG.checkoutUrl` avec votre lien Shopify ou Stripe, ainsi que les pages légales (CGV, rétractation, mentions légales).

## Sources des données
- Dureté en Belgique : [Callmepower](https://callmepower.be/fr/eau/qualite/durete-eau), [be.brussels](https://be.brussels/fr/environnement-dechets/qualite-de-leau)
- Dureté en France : [Selectra, eau calcaire](https://eau.selectra.info/qualite-environnement/eau-calcaire), [Paris](https://eau.selectra.info/eau-de-paris/durete), [Marseille](https://eau.selectra.info/eaux-de-marseille/durete), [Strasbourg](https://www.strasbourg.eu/eau-strasbourg-questions)
- Débits et consommation des douches : [Selectra](https://eau.selectra.info/consommation/douche), [Test-Achats](https://www.test-achats.be/maison-energie/chauffer-habitation-eau/news/des-douches-plus-courtes-pour-economiser-des-centaines-euros), [Kelwatt](https://www.kelwatt.fr/eau/consommation/douche)
