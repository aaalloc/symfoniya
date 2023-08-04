import { useRouter } from 'next/router';

const PlaylistPage = () => {
    const router = useRouter();
    const data = router.query;
    console.log(data.playlist)

    // Vous pouvez maintenant utiliser la variable 'name' dans votre composant
    // Par exemple, l'afficher dans une balise h1 :
    return (
        <div>
            <h1>Playlist: {data.playlist}</h1>
        </div>
    );
};

export default PlaylistPage;