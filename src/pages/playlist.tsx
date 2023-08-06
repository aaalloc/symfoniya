import { useRouter } from 'next/router';
import Music from './music';

const PlaylistPage = () => {
    const router = useRouter();
    const data = router.query;
    console.log(data.playlist)

    return (
        <Music name={data.playlist as string} />
    );
};

export default PlaylistPage;