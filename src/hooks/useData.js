import { useState, useEffect } from "react";

export const useData = (type) => {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [countryFilter, setCountryFilter] = useState("");
  const [rateFilter, setRateFilter] = useState("");

  useEffect(() => {
    fetchData();
  }, [type]);

  const fetchData = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/data/${type}`);
      const data = await response.json();
      setItems(data);
      setFilteredItems(data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const updateData = async (newData) => {
    try {
      const response = await fetch(`http://localhost:3001/api/data/${type}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newData),
      });

      if (!response.ok) {
        throw new Error("Failed to update data");
      }

      fetchData();
    } catch (error) {
      console.error("Error updating data:", error);
    }
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    const trimmedSearch = term.trim().toLowerCase();
    const filtered = items.filter((item) => {
      if (!trimmedSearch) return true;
      const inName = item.name?.toLowerCase().includes(trimmedSearch);
      const inCountry = item.country?.toLowerCase().includes(trimmedSearch);
      const inStatus = item.status?.toLowerCase().includes(trimmedSearch);
      const inRate = (item.rate + '').toLowerCase().includes(trimmedSearch);
      const inChapters = (item.chapters + '').toLowerCase().includes(trimmedSearch);
      const inGenres = Array.isArray(item.genres)
        ? item.genres.some((g) => g.toLowerCase().includes(trimmedSearch))
        : false;
      const inLink = item.link?.toLowerCase().includes(trimmedSearch);
      return (
        inName || inCountry || inStatus || inRate || inChapters || inGenres || inLink
      );
    });
    setFilteredItems(filtered);
  };


  const handleFilter = () => {
    let filtered = items;

    if (statusFilter) {
      filtered = filtered.filter((item) => item.status === statusFilter);
    }

    if (countryFilter) {
      filtered = filtered.filter((item) => item.country === countryFilter);
    }

    if (rateFilter) {
      filtered = filtered.filter((item) => item.rate >= parseFloat(rateFilter));
    }

    setFilteredItems(filtered);
  };

  const handleAdd = (newItem) => {
    const updatedItems = [...items, newItem];
    setItems(updatedItems);
    setFilteredItems(updatedItems);

    updateData(updatedItems);
  };

  const handleUpdate = (updatedItem) => {
    const updatedItems = items.map((item) =>
      item.id === updatedItem.id ? updatedItem : item
    );
    setItems(updatedItems);
    setFilteredItems(updatedItems);

    updateData(updatedItems);
  };

  const handleDelete = (id) => {
    const updatedItems = items.filter((item) => item.id !== id);
    setItems(updatedItems);
    setFilteredItems(updatedItems);

    updateData(updatedItems);
  };

  return {
    items,
    filteredItems,
    searchTerm,
    statusFilter,
    countryFilter,
    rateFilter,
    handleSearch,
    handleFilter,
    handleAdd,
    handleUpdate,
    handleDelete,
    setSearchTerm,
    setStatusFilter,
    setCountryFilter,
    setRateFilter,
  };
};
