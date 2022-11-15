import { Box, FlatList, useToast } from "native-base";
import { useEffect, useState } from "react";
import { Share } from "react-native";
import { api } from "../services/api";
import { EmptyMyPoolList } from "./EmptyMyPoolList";
import { Game, GameProps } from "./Game";
import { Loading } from "./Loading";

interface Props {
  poolId: string;
  code: string;
}

export function Guesses({ poolId, code }: Props) {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingGuess, setIsLoadingGuess] = useState(false);
  const [games, setGames] = useState<GameProps[]>([]);
  const [firstTeamPoints, setFirstTeamPoints] = useState("");
  const [secondTeamPoints, setSecondTeamPoints] = useState("");

  const toast = useToast();

  async function fetchGames() {
    try {
      setIsLoading(true);

      const { data } = await api.get(`/pools/${poolId}/games`);
      console.log(data);
      setGames(data.games);
    } catch (err) {
      console.log(err);

      toast.show({
        title: "Não foi possível carregar os jogos",
        placement: "top",
        bgColor: "red.500",
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleGuessConfirm(gameId: string) {
    try {
      setIsLoading(true);
      setIsLoadingGuess(true);

      if (!firstTeamPoints.trim() || !secondTeamPoints.trim()) {
        return toast.show({
          title: "Informe o placar do palpite",
          placement: "top",
          bgColor: "red.500",
        });
      }

      await api.post(`/pools/${poolId}/games/${gameId}/guesses`, {
        firstTeamPoints: Number(firstTeamPoints),
        secondTeamPoints: Number(secondTeamPoints),
      });

      toast.show({
        title: "Palpite enviado com sucesso",
        placement: "top",
        bgColor: "green.500",
      });

      fetchGames();
    } catch (err) {
      console.log(err);

      if (
        err.response?.data?.message ===
        "You cannot send guesses after the game date"
      ) {
        return toast.show({
          title: "Você não pode dar palpite depois da data do jogo!",
          placement: "top",
          bgColor: "red.500",
        });
      }

      toast.show({
        title: "Não foi possível enviar o palpite!",
        placement: "top",
        bgColor: "red.500",
      });
    } finally {
      setIsLoading(false);
      setIsLoadingGuess(false);
    }
  }

  async function handleCodeShare() {
    await Share.share({
      message: code,
    });
  }

  useEffect(() => {
    fetchGames();
  }, [poolId]);

  if (isLoading) {
    return <Loading />;
  }
  return (
    <FlatList
      data={games}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <Game
          data={item}
          isLoading={isLoadingGuess}
          setFirstTeamPoints={setFirstTeamPoints}
          setSecondTeamPoints={setSecondTeamPoints}
          onGuessConfirm={() => handleGuessConfirm(item.id)}
        />
      )}
      _contentContainerStyle={{ pb: 40 }}
      ListEmptyComponent={() => (
        <EmptyMyPoolList code={code} onShare={handleCodeShare} />
      )}
    />
  );
}
