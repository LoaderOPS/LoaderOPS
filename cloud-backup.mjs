// Optional Firebase cloud backup. This file is not loaded before user opts in.
import {firebaseConfig} from './firebase-config.mjs';
const VERSION='11.10.0';
let auth, firestore, firebaseAuth, firebaseDb, user=null;
export function isConfigured(){return !!(firebaseConfig?.apiKey && firebaseConfig?.authDomain && firebaseConfig?.projectId && firebaseConfig?.appId)}
export async function connect(){
 if(!isConfigured())throw Error('Firebase is not configured yet. See SETUP_FIREBASE.md.');
 const [appModule,a,d]=await Promise.all([
   import(`https://www.gstatic.com/firebasejs/${VERSION}/firebase-app.js`),
   import(`https://www.gstatic.com/firebasejs/${VERSION}/firebase-auth.js`),
   import(`https://www.gstatic.com/firebasejs/${VERSION}/firebase-firestore.js`)]);
 firebaseAuth=a;firebaseDb=d;
 const app=appModule.getApps().length?appModule.getApp():appModule.initializeApp(firebaseConfig);
 auth=a.getAuth(app);firestore=d.getFirestore(app);
 await a.setPersistence(auth,a.browserLocalPersistence);
 const provider=new a.GoogleAuthProvider();
 const result=await a.signInWithPopup(auth,provider);
 user=result.user;
 return {uid:user.uid,email:user.email};
}
export function activeUser(){return user?{uid:user.uid,email:user.email}:null}
function requireUser(){if(!user||!firestore)throw Error('Connect Google for backup first');return firebaseDb.doc(firestore,'otBackups',user.uid)}
export async function getBackup(){const doc=await firebaseDb.getDocFromServer(requireUser());return doc.exists()?doc.data():null}
export async function saveBackup(state){
 const payload=JSON.stringify({schema:'MyOTTrackerState',version:1,data:state});
 if(new TextEncoder().encode(payload).length>800000)throw Error('Backup is too large for one cloud snapshot. Export JSON locally instead.');
 await firebaseDb.setDoc(requireUser(),{payload,formatVersion:1,savedAt:firebaseDb.serverTimestamp()});
 return new Date().toLocaleString();
}
export async function disconnect(){if(auth)await firebaseAuth.signOut(auth);user=null}
export function decodeBackup(backup){
 const item=JSON.parse(backup.payload);
 if(item.schema!=='MyOTTrackerState'||item.version!==1||!item.data||!Array.isArray(item.data.records)||!item.data.roster||!item.data.holidays||!item.data.settings)throw Error('Unsupported cloud backup');
 return item.data;
}
