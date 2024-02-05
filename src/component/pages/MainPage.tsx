// src/components/GameList.tsx
import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import Header from 'component/block/Header/header';

interface Platform {
  name: string;
}

interface Genre {
  name: string;
}

interface RawgGame {
  id: number;
  name: string;
  platforms: { platform: Platform }[];
  genres: Genre[];
  background_image: string;
}

interface Game {
  id: number;
  name: string;
  platform: string;
  genre: string;
  background_image: string;
  video_url: string; 
}

const Container = styled.div`
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 20px;
  width: 100%;
  height: auto;
  margin-top: 2.5rem;
`;

const Sidebar = styled.div`
  display: flex;
  flex-direction: column;
  position: fixed;
  width: 12rem;
  height: 100%;
  overflow-y: auto;
  justify-content: flex-start;
  align-items: center;
  margin-top: 6.1rem;
  background-color: #fff;
`;

const tabStyles = `
  padding: 10px;
  margin-bottom: 20px;
  cursor: pointer;
  border-radius: 5px;
  font-family: 'Pretendard-Bold';

`;

const Tab = styled.div<{ isActive: boolean }>`
  width: 100%;
  ${tabStyles}
  background-color: ${({ isActive }) => (isActive ? '#fff' : 'transparent')};
  ${({ isActive }) => isActive && 'font-weight: bold;'}
  transition: background-color 0.3s ease-in-out;
  text-align: center;
  
  &:hover {
    background-color: #E60013;
    opacity: 1;
    color: #fff;
  }
`;

const Content = styled.div`
  width: 100%;
  height: auto;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  padding: 20px;
`;


const GameItem = styled.li`
  list-style: none;
  background-color: #fff;
  padding: 10px;
  border-radius: 5px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  text-align: center;
  font-size: 0.8rem;
  border: 1px solid #ccc;
  position: relative;
  transition: background-color 0.3s ease-in-out;
  margin-top: 5rem;
  margin-bottom: -5rem;


  &:hover {
    background-color: #E60013;
    color: #fff;
    cursor: pointer;
  }

  .Game-Title {
    padding: 10px;
    font-size: 1rem;
    text-align: center;
  }

  .Game-Platform {
    font-size: 0.8rem;
    padding: 10px;
    text-align: center;
    font-weight: 300;
  }

  .Game-Genre {
    font-size: 0.9rem;
    padding: 10px;
    text-align: center;
    font-weight: 600;
  }
`;

const GameImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 5px;
  margin-top: 1rem;

`;



const GameList = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [selectedPlatformTitle, setSelectedPlatformTitle] = useState<string>('All');
  const PLATFORMS = ['PC', 'PlayStation 5', 'Xbox Series S/X', 'Nintendo Switch'];

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const response = await axios.get('https://api.rawg.io/api/games', {
          params: {
            key: 'b72a35a54e904b01a822e381af60b766',
            page: page,
          },
        });
        const gamesDetails = response.data.results.map((game: RawgGame) => ({
          id: game.id,
          name: game.name,
          platform: game.platforms.map((platform) => platform.platform.name).join(', '),
          genre: game.genres.map((genre) => genre.name).join(', '),
          background_image: game.background_image,
        }));

        const newGames = gamesDetails.filter((newGame: Game) => !games.some((prevGame: Game) => prevGame.id === newGame.id));
        setGames((prevGames) => [...prevGames, ...newGames]);
      } catch (error) {
        console.error('Error fetching games:', error);
      }
    };
    fetchGames();
  }, [page, games, setGames]);

// -------------------------------------------------------

  const handleScroll = () => {
    if (
      window.innerHeight + document.documentElement.scrollTop ===
      document.documentElement.offsetHeight
    ) {
      setPage((prevPage) => prevPage + 1);
    }
  };

// -------------------------------------------------------

const throttle = (func: (...args: any[]) => void, delay: number) => {
  let timeout: NodeJS.Timeout | undefined;
  return function (...args: any[]) {
    if (!timeout) {
      timeout = setTimeout(() => {
        func(...args);
        timeout = undefined;
      }, delay);
    }
  };
};

  const throttledHandleScroll = throttle(handleScroll, 200);

  useEffect(() => {
    window.addEventListener('scroll', throttledHandleScroll);
    return () => {
      window.removeEventListener('scroll', throttledHandleScroll);
    };
  }, [throttledHandleScroll]);

  const filteredGames = selectedPlatform
    ? games.filter((game) => game.platform.split(', ').includes(selectedPlatform))
    : games;


    // -------------------------------------------------------

    const updateSelectedPlatformTitle = useCallback(() => {
      if (!selectedPlatform) {
        setSelectedPlatformTitle('All');
      } else {
        setSelectedPlatformTitle(selectedPlatform);
      }
    }, [selectedPlatform, setSelectedPlatformTitle]);
    
    useEffect(() => {
      updateSelectedPlatformTitle();
    }, [selectedPlatform, updateSelectedPlatformTitle]);

    return (
      <Container>
        <Header />
        <Sidebar>
        <Tab onClick={() => setSelectedPlatform(null)} isActive={!selectedPlatform}>
          All
        </Tab>
          {PLATFORMS.map((platform) => (
          <Tab
            key={platform}
            onClick={() => setSelectedPlatform(platform)}
            isActive={selectedPlatform === platform}
          >
            {platform}
          </Tab>
        ))}
        </Sidebar>
        <Content>
        <h2 style={{ display: 'flex', justifyContent:'center', alignItems:'center',  position:'absolute', marginTop:'-2rem' }}>{selectedPlatformTitle} </h2>
          {filteredGames.map((game) => (
            <GameItem key={game.id}>
              <strong className='Game-Title'>{game.name}</strong>
              <span className='Game-Platform'>{game.platform}</span>
              <span className='Game-Genre'>{game.genre}</span>
              <GameImage src={game.background_image} alt={game.name} />
            </GameItem>
          ))}
        </Content>
      </Container>
    );
  };
  
  export default GameList;