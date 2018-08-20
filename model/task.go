package model

import (
	"database/sql"
	"errors"

	"github.com/jmoiron/sqlx"
)

type Crew struct {
	CrewID  int64  `db:"crew_id" json:"crew_id"`
	Name    string `json:"name"`
	Alias   string `json:"alias"`
	Sex     string `json:"sex"`
	Image   string `json:"image"`
	Date    string `json:"date"`
	Contact int64  `json:"contact"`
}

type CrewDetail struct {
	CrewID      int64     `db:"crew_id" json:"crew_id"`
	Name        string    `json:"name"`
	Alias       string    `json:"alias"`
	Sex         string    `json:"sex"`
	Image       string    `json:"image"`
	Date        string    `json:"date"`
	Contact     int64     `json:"contact"`
	Personality []*string `json:"personality"`
	Specialty   []*string `json:"specialty"`
}

type Personality struct {
	CrewID      int64  `db:"crew_id" json:"crew_id"`
	Personality string `json:"personality"`
}
type Specialty struct {
	CrewID    int64  `db:"crew_id" json:"crew_id"`
	Specialty string `json:"specialty"`
}

func GetCrewsAll(dbx *sqlx.DB) (crews []Crew, err error) {
	if err := dbx.Select(&crews, "select * from crews order by crew_id"); err != nil {
		return nil, err
	}
	return crews, nil
}

func GetCrewDetail(dbx *sqlx.DB, id string) (*CrewDetail, error) {
	type scanCrewDetail struct {
		CrewID      int64   `db:"crew_id" json:"crew_id"`
		Name        string  `json:"name"`
		Alias       string  `json:"alias"`
		Sex         string  `json:"sex"`
		Image       string  `json:"image"`
		Date        string  `json:"date"`
		Contact     int64   `json:"contact"`
		Personality *string `json:"personality"`
		Specialty   *string `json:"specialty"`
	}
	var crewDetail []scanCrewDetail
	if err := dbx.Select(&crewDetail,
		`select A.crew_id, A.name, A.alias, A.sex, A.image, A.date, A.contact,
      B.personality, C.specialty
    from crews A
    left outer join characters B on A.crew_id = B.crew_id
    left outer join specialties C on A.crew_id = C.crew_id
    where A.crew_id = ?`, id); err != nil {
		return nil, err
	}
	var sp []*string
	var p []*string
	for _, c := range crewDetail {
		if c.Specialty != nil {
			sp = append(sp, c.Specialty)
		}
		if c.Personality != nil {
			p = append(p, c.Personality)
		}
	}
	crew := CrewDetail{
		CrewID:      crewDetail[0].CrewID,
		Name:        crewDetail[0].Name,
		Alias:       crewDetail[0].Alias,
		Sex:         crewDetail[0].Sex,
		Image:       crewDetail[0].Image,
		Date:        crewDetail[0].Date,
		Contact:     crewDetail[0].Contact,
		Personality: p,
		Specialty:   sp,
	}
	return &crew, nil
}

func (c *Crew) Insert(tx *sqlx.Tx) (sql.Result, error) {
	if c.Name == "" && c.Alias == "" {
		return nil, errors.New("名前かニックネームのどちらかは必要です")
	}
	if c.Image == "" {
		c.Image = "default.jpg"
	}
	stmt, err := tx.Prepare(`
	insert into crews (name, alias, sex, image, date, contact)
	values(?, ?, ?, ?, ?, ?)
	`)
	if err != nil {
		return nil, err
	}
	defer stmt.Close()
	return stmt.Exec(c.Name, c.Alias, c.Sex, c.Image, c.Date, c.Contact)
}

func (p *Personality) InsertPer(tx *sqlx.Tx) (sql.Result, error) {
	stmt, err := tx.Prepare(`
	insert into characters (crew_id, personality) values (?, ?)
	`)
	if err != nil {
		return nil, err
	}
	defer stmt.Close()
	return stmt.Exec(p.CrewID, p.Personality)
}

func (s *Specialty) InsertSp(tx *sqlx.Tx) (sql.Result, error) {
	stmt, err := tx.Prepare(`
	insert into specialties (crew_id, specialty) values (?, ?)
	`)
	if err != nil {
		return nil, err
	}
	defer stmt.Close()
	return stmt.Exec(s.CrewID, s.Specialty)
}

func SearchBySpecialty(dbx *sqlx.DB, sp string) (crews []Crew, err error) {
	if err := dbx.Select(&crews,
		`select A.crew_id, A.name, A.alias, A.sex, A.image, A.date, A.contact
    from crews A
    inner join specialties B on A.crew_id = B.crew_id
    where B.specialty like ?`, "%"+sp+"%"); err != nil {
		return nil, err
	}
	return crews, nil
}

func (c *Crew) Delete(tx *sqlx.Tx) (sql.Result, error) {
	stmt, err := tx.Prepare(`
    delete from crews where crew_id = ?;
    delete from specialty where crew_id = ?;
    delete from personality where crew_id = ?
    `)
	if err != nil {
		return nil, err
	}
	defer stmt.Close()
	return stmt.Exec(c.CrewID)
}

func (c *Crew) UpdateCrew(tx *sqlx.Tx) (sql.Result, error) {
	stmt, err := tx.Prepare(`
	update crews set name = ?, alias = ?, sex = ?, image = ?, date = ?, contact = ? where crew_id = ?
	`)
	if err != nil {
		return nil, err
	}
	defer stmt.Close()
	return stmt.Exec(c.Name, c.Alias, c.Sex, c.Image, c.Date, c.Contact)
}
