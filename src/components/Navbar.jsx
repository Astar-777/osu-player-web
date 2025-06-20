import { useState, useRef } from "react";
import { IoMdSearch } from "react-icons/io";
import { IoIosRefresh } from "react-icons/io";
import { deleteDB } from "../helpers/dbHelper.js";
import "../css/Navbar.css";

function Navbar({ setSearchQuery, songs }) {
    const [isHovered, setIsHovered] = useState(false);
    const [search, setSearch] = useState("");
    const inputRef = useRef(null);

    const handleChange = (e) => {
        setSearch(e.target.value);
        setSearchQuery(e.target.value);
    };

    const handleRefresh = async () => {

        await deleteDB();
        window.location.reload();
    };

    return (
        <div className="navbar">
            <div className="left">
                <div className="title">
                    <h1 className="main-title">osu!player</h1>
                    <small className="sub-title">(web)</small>
                </div>
                <IoIosRefresh className="refresh-button" size={25} color="#ffffff" onClick={handleRefresh} />
                <p className="songs-amount">Total songs: {songs.length}</p>
            </div>

            <div className="search"
                onMouseEnter={() => {
                    setIsHovered(true);
                    setTimeout(() => inputRef.current?.focus(), 100);
                }}
                onMouseLeave={() => {
                    setIsHovered(false);
                    inputRef.current?.blur();
                }}
            >
                <input
                    ref={inputRef}
                    type="text"
                    className={`search-input ${isHovered ? "expanded" : ""}`}
                    placeholder="Search..."
                    value={search}
                    onChange={handleChange}
                />
                <IoMdSearch className="search-button" size={30} color="#ffffff" />
            </div>
        </div>
    );
}

export default Navbar;