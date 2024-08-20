import React, { useEffect, useState } from "react";
import axios from "axios";
import styles from "./Counter.module.css";

// LA REQUETE POST permet de modifier la valeur du compteur stockée dans le fichier json. On observe qu'à chaque clic sur le bouton increment, la valeur affichée est augmentée, puis sauvegardée juste après dans le fichier json.

type CounterProps = {
  initialCount?: number; // `initialCount` est optionnel pour permettre de charger à partir du serveur
};

export function Counter({ initialCount = 0 }: CounterProps) {
  const [count, setCount] = useState<number>(initialCount);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true; // Pour éviter les mises à jour d'état après le démontage

    const fetchCount = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/counter");
        if (isMounted) {
          setCount(response.data[0]);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération du compteur :", error);
      } finally {
        if (isMounted) {
          setIsLoading(false); // Fin de chargement
        }
      }
    };

    fetchCount();

    return () => {
      isMounted = false; // Marquer le composant comme démonté
    };
  }, []);

  const increment = () => {
    const newCount = count + 1;
    setCount(newCount);
    saveCount(newCount);
  };

  const decrement = () => {
    const newCount = count - 1;
    setCount(newCount);
    saveCount(newCount);
  };

  const saveCount = async (newCount: number) => {
    try {
      await axios.post("http://localhost:3000/api/counter", { count: newCount });
    } catch (error) {
      console.error("Erreur lors de la sauvegarde du compteur :", error);
    }
  };

  if (isLoading) {
    return <p>Loading...</p>; // Afficher un message de chargement pendant la récupération des données
  }

  return (
    <div className={styles.counterContainer}>
      <h1 className={styles.counterTitle}>Counter</h1>
      <p className={styles.counterValue}>{count}</p>
      <div className={styles.buttonGroup}>
        <button onClick={increment} className={styles.button}>
          Increment
        </button>
        <button onClick={decrement} className={styles.button}>
          Decrement
        </button>
      </div>
    </div>
  );
}

export default Counter;

