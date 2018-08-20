package controller

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/VG-Tech-Dojo/treasure2018/mid/hatsunem/VGCrewCollection/model"
	"github.com/gorilla/mux"
	"github.com/jmoiron/sqlx"
)

type CrewCollection struct {
	DB *sqlx.DB
}

// Get ... Crewの基本情報を取得
func (c *CrewCollection) Get(w http.ResponseWriter, r *http.Request) error {
	crews, err := model.GetCrewsAll(c.DB)
	if err != nil {
		return err
	}
	return JSON(w, 200, crews)
}

// GetDetail ... Crewの詳細情報を取得
func (c *CrewCollection) GetDetail(w http.ResponseWriter, r *http.Request) error {
	vars := mux.Vars(r)
	crewID := vars["crewId"]
	crewDetail, err := model.GetCrewDetail(c.DB, crewID)
	if err != nil {
		return err
	}
	return JSON(w, 200, crewDetail)
}

// Post ... 新しいCrewを追加
func (c *CrewCollection) Post(w http.ResponseWriter, r *http.Request) error {
	var crew model.Crew
	if err := json.NewDecoder(r.Body).Decode(&crew); err != nil {
		return err
	}

	if err := TXHandler(c.DB, func(tx *sqlx.Tx) error {
		result, err := crew.Insert(tx)
		if err != nil {
			return err
		}
		if err := tx.Commit(); err != nil {
			return err
		}
		crew.CrewID, err = result.LastInsertId()
		return err
	}); err != nil {
		return err
	}

	return JSON(w, http.StatusCreated, crew)
}

// PostPer ... crewIDに紐づけてPersonalityを追加
func (c *CrewCollection) PostPer(w http.ResponseWriter, r *http.Request) error {
	var per model.Personality
	if err := json.NewDecoder(r.Body).Decode(&per); err != nil {
		return err
	}

	if err := TXHandler(c.DB, func(tx *sqlx.Tx) error {
		_, err := per.InsertPer(tx)
		if err != nil {
			return err
		}
		if err := tx.Commit(); err != nil {
			return err
		}
		return err
	}); err != nil {
		return err
	}
	crewID := strconv.FormatInt(per.CrewID, 10)
	crewDetail, err := model.GetCrewDetail(c.DB, crewID)
	if err != nil {
		return err
	}
	return JSON(w, http.StatusCreated, crewDetail)
}

// PostSp ... crewIDに紐づけてSpecialtyを追加
func (c *CrewCollection) PostSp(w http.ResponseWriter, r *http.Request) error {
	var sp model.Specialty
	if err := json.NewDecoder(r.Body).Decode(&sp); err != nil {
		return err
	}

	if err := TXHandler(c.DB, func(tx *sqlx.Tx) error {
		_, err := sp.InsertSp(tx)
		if err != nil {
			return err
		}
		if err := tx.Commit(); err != nil {
			return err
		}
		return err
	}); err != nil {
		return err
	}
	crewID := strconv.FormatInt(sp.CrewID, 10)
	crewDetail, err := model.GetCrewDetail(c.DB, crewID)
	if err != nil {
		return err
	}
	return JSON(w, http.StatusCreated, crewDetail)
}

// Search ... Specialtyで検索
func (c *CrewCollection) Search(w http.ResponseWriter, r *http.Request) error {
	sp := r.FormValue("sp")
	crews, err := model.SearchBySpecialty(c.DB, sp)
	if err != nil {
		return err
	}
	return JSON(w, 200, crews)
}

func (c *CrewCollection) Delete(w http.ResponseWriter, r *http.Request) error {
	var crew model.Crew
	if err := json.NewDecoder(r.Body).Decode(&crew); err != nil {
		return err
	}

	if err := TXHandler(c.DB, func(tx *sqlx.Tx) error {
		_, err := crew.Delete(tx)
		if err != nil {
			return err
		}
		return tx.Commit()
	}); err != nil {
		return err
	}

	return JSON(w, http.StatusOK, crew)
}

func (c *CrewCollection) Update(w http.ResponseWriter, r *http.Request) error {
	var crew model.Crew
	if err := json.NewDecoder(r.Body).Decode(&crew); err != nil {
		return err
	}

	if err := TXHandler(c.DB, func(tx *sqlx.Tx) error {
		_, err := crew.UpdateCrew(tx)
		if err != nil {
			return err
		}
		if err := tx.Commit(); err != nil {
			return err
		}
		return err
	}); err != nil {
		return err
	}
	crewID := strconv.FormatInt(crew.CrewID, 10)
	crewDetail, err := model.GetCrewDetail(c.DB, crewID)
	if err != nil {
		return err
	}
	return JSON(w, http.StatusCreated, crewDetail)
}
